export const settingsGroups = [
  {
    id: "account",
    title: "Account and personal details",
    items: [
      { key: "profile-info", title: "Profile information", desc: "Change the information people see on your profile.", panel: "profileInfo" },
      { key: "contact-info", title: "Contact info", desc: "Manage the email address and phone number connected to your account.", panel: "contactInfo" },
      {
        key: "basic-data",
        title: "Basic data",
        desc: "Manage your birthday and what happens to your account after memorialization.",
        controls: [
          { field: "settings_birthday", type: "date", label: "Birthday" },
          {
            field: "settings_memorialization",
            type: "choice",
            label: "After memorialization",
            options: [
              { value: "delete", label: "Delete my account" },
              { value: "memorialize", label: "Turn my profile into a memorial" },
            ],
          },
        ],
      },
      { key: "account-status", title: "Account status", desc: "Temporarily deactivate your account.", panel: "accountStatus" },
    ],
  },
  {
    id: "security",
    title: "Password and security",
    items: [
      { key: "password", title: "Password changes", desc: "Update the password used for your VibeHQ account.", panel: "password" },
      {
        key: "two-factor",
        title: "Two-Factor Authentication",
        desc: "Choose text messages or an authenticator app for an additional sign-in step.",
        controls: [
          {
            field: "settings_two_factor",
            type: "choice",
            label: "Verification method",
            options: [
              { value: "off", label: "Off" },
              { value: "sms", label: "Text message" },
              { value: "app", label: "Authenticator app" },
            ],
          },
        ],
      },
      { key: "login-activity", title: "Login activity", desc: "Review recent devices and login locations.", panel: "loginActivity" },
      {
        key: "login-alerts",
        title: "Login alerts",
        desc: "Get notified when a new login attempt is detected.",
        controls: [{ field: "settings_login_alerts", type: "toggle", label: "Login alerts", help: "Get notified when a new login attempt is detected." }],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy and interactions",
    items: [
      {
        key: "account-visibility",
        title: "Account visibility",
        desc: "Choose whether your profile is public or private.",
        controls: [
          {
            field: "settings_visibility",
            type: "choice",
            label: "Profile visibility",
            options: [
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ],
          },
        ],
      },
      {
        key: "post-controls",
        title: "Post controls",
        desc: "Choose who can see your posts, photos, and stories.",
        controls: [
          {
            field: "settings_post_controls",
            type: "choice",
            label: "Who can see your posts",
            options: [
              { value: "everyone", label: "Everyone" },
              { value: "friends", label: "Friends" },
              { value: "only_me", label: "Only me" },
            ],
          },
        ],
      },
      {
        key: "contact-limits",
        title: "Contact limits",
        desc: "Control who can send friend requests, direct messages, and follows.",
        controls: [
          {
            field: "settings_contact_limits",
            type: "choice",
            label: "Who can contact you",
            options: [
              { value: "everyone", label: "Everyone" },
              { value: "friends_of_friends", label: "Friends of friends" },
              { value: "nobody", label: "Nobody" },
            ],
          },
        ],
      },
      {
        key: "tagging-controls",
        title: "Tagging controls",
        desc: "Control tag review and who can add tags to your profile.",
        controls: [
          {
            field: "settings_tagging",
            type: "choice",
            label: "Who can tag you",
            options: [
              { value: "everyone", label: "Everyone" },
              { value: "friends", label: "Friends" },
              { value: "nobody", label: "Nobody" },
            ],
          },
          { field: "settings_tag_review", type: "toggle", label: "Review tags before they appear" },
        ],
      },
      {
        key: "activity-status",
        title: "Activity status",
        desc: "Choose whether other people can see when you are online.",
        controls: [{ field: "settings_activity_status", type: "toggle", label: "Show when I'm online" }],
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications and display",
    items: [
      {
        key: "notifications",
        title: "Notifications",
        desc: "Choose how VibeHQ can notify you.",
        controls: [
          { field: "settings_notify_push", type: "toggle", label: "Push notifications" },
          { field: "settings_notify_email", type: "toggle", label: "Email notifications" },
          { field: "settings_notify_sound", type: "toggle", label: "Notification sounds" },
        ],
      },
      { key: "appearance", title: "Appearance", desc: "Choose the appearance of VibeHQ.", panel: "appearance" },
    ],
  },
];

export const settingsItems = settingsGroups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.title })));

export function findSetting(key) {
  return settingsItems.find((item) => item.key === key);
}