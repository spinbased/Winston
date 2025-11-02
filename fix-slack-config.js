/**
 * Automated Slack Bot Configuration Script
 * Uses Playwright to fix Event Subscriptions
 *
 * Usage: node fix-slack-config.js
 */

const { chromium } = require('playwright');

async function fixSlackConfig() {
  console.log('🤖 Starting automated Slack configuration fix...\n');

  const browser = await chromium.launch({
    headless: false,  // Show browser so you can see what's happening
    slowMo: 1000      // Slow down so you can follow along
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to Slack API
    console.log('📱 Opening Slack API...');
    await page.goto('https://api.slack.com/apps');
    await page.waitForTimeout(3000);

    console.log('\n⚠️  MANUAL STEP REQUIRED:');
    console.log('1. Please log in to Slack if prompted');
    console.log('2. Click on your Winston app');
    console.log('3. Press ENTER in this terminal when ready...\n');

    // Wait for user to manually log in and select app
    await page.waitForTimeout(30000);  // 30 seconds

    // Step 2: Go to Event Subscriptions
    console.log('🔧 Navigating to Event Subscriptions...');

    // Try to click Event Subscriptions in sidebar
    const eventSubLink = page.locator('text=Event Subscriptions').first();
    if (await eventSubLink.isVisible()) {
      await eventSubLink.click();
      await page.waitForTimeout(2000);
      console.log('✅ On Event Subscriptions page');
    } else {
      console.log('⚠️  Could not find Event Subscriptions link');
      console.log('   Please navigate manually to Event Subscriptions');
      await page.waitForTimeout(5000);
    }

    // Step 3: Check and enable Events
    console.log('\n🔍 Checking Event Subscriptions toggle...');
    const toggleButton = page.locator('[role="switch"]').first();
    if (await toggleButton.isVisible()) {
      const isEnabled = await toggleButton.getAttribute('aria-checked');
      if (isEnabled !== 'true') {
        console.log('   Enabling Event Subscriptions...');
        await toggleButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Event Subscriptions enabled');
      } else {
        console.log('✅ Event Subscriptions already enabled');
      }
    }

    // Step 4: Check Request URL
    console.log('\n🌐 Checking Request URL...');
    const requestUrlInput = page.locator('input[placeholder*="https://"]').first();
    if (await requestUrlInput.isVisible()) {
      const currentUrl = await requestUrlInput.inputValue();
      console.log(`   Current URL: ${currentUrl}`);

      const expectedUrl = 'https://winston-production.up.railway.app/slack/events';
      if (currentUrl !== expectedUrl) {
        console.log('   Updating Request URL...');
        await requestUrlInput.fill(expectedUrl);
        await page.waitForTimeout(2000);
        console.log('✅ Request URL updated');
      } else {
        console.log('✅ Request URL is correct');
      }
    }

    // Step 5: Add Bot Events
    console.log('\n📋 Checking Bot Events...');

    // Scroll to bot events section
    await page.locator('text=Subscribe to bot events').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const eventsToAdd = ['message.im', 'message.channels', 'app_mention'];

    for (const eventName of eventsToAdd) {
      // Check if event already exists
      const eventExists = await page.locator(`text=${eventName}`).count() > 0;

      if (!eventExists) {
        console.log(`   Adding ${eventName}...`);

        // Click "Add Bot User Event" button
        const addButton = page.locator('button:has-text("Add Bot User Event")').first();
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(1000);

          // Type event name in search/dropdown
          await page.keyboard.type(eventName);
          await page.waitForTimeout(500);

          // Select the event
          await page.locator(`text=${eventName}`).first().click();
          await page.waitForTimeout(1000);

          console.log(`✅ Added ${eventName}`);
        }
      } else {
        console.log(`✅ ${eventName} already added`);
      }
    }

    // Step 6: Save Changes
    console.log('\n💾 Saving changes...');
    const saveButton = page.locator('button:has-text("Save Changes")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Changes saved');
    } else {
      console.log('   No unsaved changes or Save button not visible');
    }

    // Step 7: Navigate to Install App
    console.log('\n🔄 Navigating to reinstall app...');
    const installLink = page.locator('text=Install App').first();
    if (await installLink.isVisible()) {
      await installLink.click();
      await page.waitForTimeout(2000);

      // Click Reinstall to Workspace
      const reinstallButton = page.locator('button:has-text("Reinstall to Workspace")').first();
      if (await reinstallButton.isVisible()) {
        console.log('   Reinstalling app to workspace...');
        await reinstallButton.click();
        await page.waitForTimeout(3000);

        // Click Allow on permission screen
        const allowButton = page.locator('button:has-text("Allow")').first();
        if (await allowButton.isVisible()) {
          await allowButton.click();
          await page.waitForTimeout(2000);
          console.log('✅ App reinstalled successfully');
        }
      } else {
        console.log('✅ App already installed or no reinstall needed');
      }
    }

    console.log('\n🎉 Configuration complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Slack');
    console.log('2. Send your bot a message');
    console.log('3. It should respond with AI!');
    console.log('\nKeeping browser open for 10 seconds so you can verify...');

    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Error during automation:', error.message);
    console.log('\n💡 Tip: You may need to complete some steps manually');
    console.log('   The browser will stay open so you can finish the configuration');
    await page.waitForTimeout(30000);
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed');
  }
}

// Run the script
fixSlackConfig().catch(console.error);
