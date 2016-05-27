{
  "server": {
    "protocol": "http",
    "host": "slidewikiauth.spdns.eu:3000"
  },
  "github": {
    "key": "",
    "secret": "",
    "callback": "/handle_github_callback"
  },
  "google": {
    "key": "",
    "secret": "",
    "callback": "/handle_google_callback",
    "scope": ["https://www.googleapis.com/auth/plus.me", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
    "custom_params": {
      "access_type": "offline"
    }
  }
}
