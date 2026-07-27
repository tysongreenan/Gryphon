from app.services.site_urls import ONBOARDING_SITES, resolve_start_url


def test_known_site_keys():
    assert resolve_start_url("websitefeedback") == "https://websitefeedback.ca/login"
    assert resolve_start_url("LinkedIn") == "https://www.linkedin.com/login"


def test_onboarding_catalog_has_login_urls():
    assert len(ONBOARDING_SITES) >= 5
    for site in ONBOARDING_SITES:
        assert site["start_url"].startswith("https://")
        assert resolve_start_url(site["key"]) == site["start_url"]


def test_explicit_and_metadata_win():
    assert (
        resolve_start_url(
            "other",
            explicit_url="https://example.com/signin",
        )
        == "https://example.com/signin"
    )
    assert (
        resolve_start_url(
            "other",
            agent_metadata={"start_url": "https://acme.test/login"},
        )
        == "https://acme.test/login"
    )


def test_hostname_heuristic():
    assert resolve_start_url("app.example.com") == "https://app.example.com/login"
