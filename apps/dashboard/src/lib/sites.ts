/** Mirrors API onboarding catalog — login URLs so humans never type them. */

export type CatalogSite = {
  key: string;
  label: string;
  start_url: string;
};

export const ONBOARDING_SITES: CatalogSite[] = [
  {
    key: "websitefeedback",
    label: "Website Feedback",
    start_url: "https://websitefeedback.ca/login",
  },
  {
    key: "gmail",
    label: "Gmail",
    start_url:
      "https://accounts.google.com/ServiceLogin?service=mail",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    start_url: "https://www.linkedin.com/login",
  },
  {
    key: "stripe",
    label: "Stripe",
    start_url: "https://dashboard.stripe.com/login",
  },
  {
    key: "github",
    label: "GitHub",
    start_url: "https://github.com/login",
  },
  {
    key: "wordpress",
    label: "WordPress.com",
    start_url: "https://wordpress.com/log-in",
  },
  {
    key: "slack",
    label: "Slack",
    start_url: "https://slack.com/signin",
  },
  {
    key: "notion",
    label: "Notion",
    start_url: "https://www.notion.so/login",
  },
  {
    key: "shopify",
    label: "Shopify",
    start_url: "https://accounts.shopify.com/store-login",
  },
];
