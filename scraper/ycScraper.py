import asyncio
import time
from playwright.async_api import async_playwright

YC_URL = "https://www.ycombinator.com/companies"
BASE_SITE = "https://www.ycombinator.com"

async def scrape_yc_companies():
    companies = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Opening YC companies page...")
        start_load = time.perf_counter()
        await page.goto(YC_URL, timeout=60000)
        await page.wait_for_selector('a[href^="/companies/"]')
        load_time = time.perf_counter() - start_load
        print(f"Initial page load time: {load_time:.2f}s")

        prev_count = 0

        while True:
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1.5)

            company_links = await page.query_selector_all('a[href^="/companies/"]')
            current_count = len(company_links)

            print(f"Companies loaded so far: {current_count}")

            if current_count == prev_count:
                print("No more companies to load.")
                break

            prev_count = current_count

        # Extract data
        extract_start = time.perf_counter()

        for link in company_links:
            name = (await link.inner_text()).strip()
            href = await link.get_attribute("href")

            companies.append({
                "name": name,
                "company_profile_url": BASE_SITE + href
            })

        extract_time = time.perf_counter() - extract_start
        print(f"Extraction time: {extract_time:.2f}s")

        await browser.close()

    return companies


if __name__ == "__main__":
    results = asyncio.run(scrape_yc_companies())

    print("\n--- SUMMARY ---")
    print(f"Total companies scraped: {len(results)}")
    print("Sample:")
    for c in results[:5]:
        print(c)






