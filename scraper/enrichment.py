import requests
import logging
from datetime import datetime
from urllib.parse import urljoin

TIMEOUT = 3  # seconds

CAREER_PATHS = ["/careers", "/jobs"]

def check_careers_page(domain: str) -> bool:
    """
    Checks if /careers or /jobs exists on a company website.
    """
    if not domain:
        return False

    base_url = domain if domain.startswith("http") else f"https://{domain}"

    for path in CAREER_PATHS:
        try:
            url = urljoin(base_url, path)
            response = requests.get(url, timeout=TIMEOUT)

            if response.status_code == 200:
                return True

        except Exception as e:
            logging.warning(f"Enrichment failed for {base_url}{path}: {str(e)}")

    return False
