/**
 * Voice Message Service
 * Handles transcription of Slack voice messages using OpenAI Whisper
 */

import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

export class VoiceService {
  private openai: OpenAI;
  private readonly TEMP_DIR = path.join(__dirname, '../../temp');
  private readonly TRANSCRIPTION_TIMEOUT = 30000; // 30 seconds
  private readonly SUPPORTED_FORMATS = [
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/flac',
  ];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Ensure temp directory exists
    this.ensureTempDir();
  }

  /**
   * Transcribe audio from Slack voice message
   * @param fileUrl - Slack file URL (private download)
   * @param mimeType - Audio file MIME type
   * @param slackToken - Slack bot token for authentication
   * @returns Transcribed text
   */
  async transcribe(
    fileUrl: string,
    mimeType: string,
    slackToken: string
  ): Promise<string> {
    // Validate audio format
    if (!this.isSupportedFormat(mimeType)) {
      throw new Error(
        `Unsupported audio format: ${mimeType}. Supported: ${this.SUPPORTED_FORMATS.join(', ')}`
      );
    }

    console.log(`[VoiceService] Starting transcription for file: ${fileUrl}`);
    console.log(`[VoiceService] MIME type: ${mimeType}`);

    let tempFilePath: string | null = null;

    try {
      // Download audio file from Slack
      tempFilePath = await this.downloadFile(fileUrl, slackToken, mimeType);

      // Transcribe using Whisper
      const transcript = await this.transcribeFile(tempFilePath);

      console.log(
        `[VoiceService] ✅ Transcription complete: "${transcript.substring(0, 100)}..."`
      );

      return transcript;
    } catch (error: any) {
      console.error('[VoiceService] ❌ Transcription failed:', error);
      throw new Error(`Voice transcription failed: ${error.message}`);
    } finally {
      // Clean up temp file
      if (tempFilePath) {
        await this.cleanupFile(tempFilePath);
      }
    }
  }

  /**
   * Download audio file from Slack
   */
  private async downloadFile(
    fileUrl: string,
    slackToken: string,
    mimeType: string
  ): Promise<string> {
    const extension = this.getFileExtension(mimeType);
    const tempFilePath = path.join(
      this.TEMP_DIR,
      `voice_${Date.now()}${extension}`
    );

    console.log(`[VoiceService] Downloading file to: ${tempFilePath}`);

    try {
      const response = await axios.get(fileUrl, {
        headers: {
          Authorization: `Bearer ${slackToken}`,
        },
        responseType: 'arraybuffer',
        timeout: this.TRANSCRIPTION_TIMEOUT,
      });

      await writeFile(tempFilePath, response.data);

      const fileSizeKB = (response.data.length / 1024).toFixed(2);
      console.log(`[VoiceService] Downloaded ${fileSizeKB} KB`);

      return tempFilePath;
    } catch (error: any) {
      throw new Error(`Failed to download audio file: ${error.message}`);
    }
  }

  /**
   * Transcribe audio file using Whisper API
   */
  private async transcribeFile(filePath: string): Promise<string> {
    console.log(`[VoiceService] Sending to Whisper API...`);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'en', // Optimize for English
        response_format: 'text',
      });

      // Whisper returns text directly when response_format is 'text'
      return transcription as unknown as string;
    } catch (error: any) {
      console.error('[VoiceService] Whisper API error:', error);
      throw new Error(`Whisper API failed: ${error.message}`);
    }
  }

  /**
   * Clean up temporary file
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      console.log(`[VoiceService] Cleaned up temp file: ${filePath}`);
    } catch (error) {
      console.error(`[VoiceService] Failed to cleanup file: ${filePath}`, error);
    }
  }

  /**
   * Ensure temp directory exists
   */
  private async ensureTempDir(): Promise<void> {
    try {
      await mkdir(this.TEMP_DIR, { recursive: true });
    } catch (error) {
      console.error('[VoiceService] Failed to create temp directory:', error);
    }
  }

  /**
   * Check if audio format is supported
   */
  private isSupportedFormat(mimeType: string): boolean {
    return this.SUPPORTED_FORMATS.includes(mimeType.toLowerCase());
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'audio/mpeg': '.mp3',
      'audio/mp4': '.m4a',
      'audio/wav': '.wav',
      'audio/webm': '.webm',
      'audio/ogg': '.ogg',
      'audio/flac': '.flac',
    };

    return extensions[mimeType.toLowerCase()] || '.audio';
  }
}
