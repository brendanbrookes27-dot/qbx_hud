from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(1000)

        # Open HUD Simulator Controller Dock
        page.click("#dock-toggle-btn")
        page.wait_for_timeout(500)

        # Take screenshot of open simulator dock
        page.screenshot(path="/home/jules/verification/screenshots/hud_with_dock.png")

        # Click High Speed preset
        page.click("#btn-drive-fast")
        page.wait_for_timeout(600)

        # Close controller dock for clean HUD screenshot
        page.click("#dock-close-btn")
        page.wait_for_timeout(800)

        # Take final clean screenshot
        screenshot_path = "/home/jules/verification/screenshots/cyberpunk_hud_main.png"
        page.screenshot(path=screenshot_path)
        page.wait_for_timeout(1000)

        context.close()
        browser.close()

if __name__ == "__main__":
    run_verification()
