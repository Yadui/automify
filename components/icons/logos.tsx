import React from "react";

// -----------------------------------------------------------------------------
// DISCLAIMER:
// Many of these icons are UNOFFICIAL PLACEHOLDERS for demo purposes.
// For production use, please replace with official assets from the respective
// brand kits of Google, Microsoft, Slack, Salesforce, etc.
// -----------------------------------------------------------------------------

type IconProps = React.SVGProps<SVGSVGElement>;

const BaseIcon = ({ className, children, ...props }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {children}
    </svg>
);

export const Icons = {
    // --- Major Platforms ---
    googleDrive: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M7 3h10l4 7-5 9H6L2 10 7 3z" />
        </BaseIcon>
    ),
    gmail: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.51L12 13 4 6.51V6h16zM4 18V9.04L12 15l8-5.96V18H4z" />
        </BaseIcon>
    ),
    slack: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M6 15a2 2 0 1 0-2-2h2v2zm1 0a2 2 0 1 0 2 2v-2H7zm0-4a2 2 0 1 0-2-2v2h2zm4-2a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm1 0a2 2 0 1 0-2 2v2h2zm4 2a2 2 0 1 0 2-2 2 2 0 0 0-2 2zm-1 0a2 2 0 1 0-2 2v-2h2zm4 2a2 2 0 1 0 2 2v-2h-2zm-6 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />
        </BaseIcon>
    ),
    notion: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M4.021 2.913L17.3 1.932c1.631-.14 2.05.094 3.076.84L24.615 5.76c.7.514.932.654.932 1.213v16.378c0 1.026-.373 1.634-1.678 1.726l-18 1.896c-.98.046-1.445-.094-1.958-.747L.311 21.066c-.56-.747-.792-1.306-.792-1.96V4.545c0-.84.373-1.539 1.444-1.632zm20.73 1.082l-13.28.98C8.949 5.093 8.576 5.793 8.576 6.632v14.558c0 .654.232 1.213.792 1.96l3.122 4.06c.513.653.978.793 1.958.747l15.422-.934c1.304-.093 1.678-.7 1.678-1.726v-16.92c0-.53-.21-.683-.826-1.136L26.73 2.624c-1.026-.746-1.445-.84-3.076-.747v.14z" />
        </BaseIcon>
    ),
    openai: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 6.06 6.06 0 0 0 10.28-2.18 5.98 5.98 0 0 0 4-2.9 6.05 6.05 0 0 0-.74-7.1zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .4-.68v-6.74l2 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5zm-9.66-4.12a4.47 4.47 0 0 1-.54-3.02l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06l-4.83 2.79a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.48 4.48 0 0 1 2.37-1.97v5.67a.77.77 0 0 0 .39.68l5.81 3.35-2 1.17a.08.08 0 0 1-.07 0l-4.83-2.79a4.5 4.5 0 0 1-1.67-6.11zm16.6 3.85L13.1 8.36l2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1v-5.67a.8.8 0 0 0-.4-.68zm2.01-3.02l-.14-.09-4.78-2.78a.78.78 0 0 0-.78 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.3 12.86l-2-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.4.68zm1.1-2.36l2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5Z" />
        </BaseIcon>
    ),
    discord: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.315-9.673-3.548-13.66a.061.061 0 0 0-.032-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
        </BaseIcon>
    ),
    github: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </BaseIcon>
    ),
    stripe: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M13.98 9.15c-2.17-.8-3.03-1.38-3.03-2.24 0-1.02 1.12-1.54 2.5-1.54 1.25 0 3 .56 3 .56l.66-3.96S15.3 1.41 13.27 1.41c-2.07 0-3.93.7-5.17 1.83-1.31 1.18-1.96 2.77-1.96 4.72 0 4.61 5.86 5.42 5.86 7.63 0 1.26-1.42 1.64-2.73 1.64-1.58 0-3.66-.65-3.66-.65l-.71 4.32s2.32.69 4.29.69c5.45 0 8.02-2.61 8.02-6.4 0-4.66-6.33-5.32-6.33-7.67.04-1.02 1.12-1.4 2.23-1.4.95 0 2.37.3 2.37.3l-.22 2.66h-1.29z" />
        </BaseIcon>
    ),
    whatsapp: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.23-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.14-.17.2-.3.3-.5.09-.2.04-.37-.03-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.14.2 2.1 3.2 5.07 4.48.71.3 1.26.49 1.7.63.7.22 1.35.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.43 7.4h-.01c-1.87 0-3.7-.5-5.3-1.45l-.38-.22-3.95 1.04 1.05-3.85-.25-.4c-1.02-1.62-1.56-3.49-1.56-5.4 0-5.59 4.55-10.14 10.15-10.14 2.71 0 5.26 1.06 7.17 2.97a10.06 10.06 0 0 1 2.97 7.18c0 5.6-4.55 10.14-10.14 10.14h-.01zM12.05 0C5.49 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95l-1.7 6.18 6.33-1.66c1.74.95 3.69 1.45 5.68 1.45 6.55 0 11.9-5.34 11.9-11.9A11.83 11.83 0 0 0 12.05 0z" />
        </BaseIcon>
    ),
    zoom: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M4.5 9h-1C2.12 9 1 10.12 1 11.5v3C1 15.88 2.12 17 3.5 17h1c1.38 0 2.5-1.12 2.5-2.5v-3C7 10.12 5.88 9 4.5 9zM17.5 9h-1c-1.38 0-2.5 1.12-2.5 2.5v3c0 1.38 1.12 2.5 2.5 2.5h1c1.38 0 2.5-1.12 2.5-2.5v-3c0-1.38-1.12-2.5-2.5-2.5z" />
            <path d="M11 6H9c-2.21 0-4 1.79-4 4v6c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4v-6c0-2.21-1.79-4-4-4z" />
        </BaseIcon>
    ),
    // --- Microsoft Ecosystem ---
    outlook: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
        </BaseIcon>
    ),
    microsoftTeams: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M9.5 9.5h5v5h-5z" />
            <path d="M16 10.5v-1a2.5 2.5 0 0 0-5 0v1h-1v-1a3.5 3.5 0 0 1 7 0v1h-1Z" />
            <rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        </BaseIcon>
    ),
    microsoftExcel: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 9l-3 5h-2l4-6-4-6h2l3 5 3-5h2l-4 6 4 6h-2l-3-5z" />
        </BaseIcon>
    ),
    oneDrive: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M15.5 8c-2.3 0-4.3 1.7-4.5 4-.6-.4-1.3-.6-2-.6-2.2 0-4 1.8-4 4s1.8 4 4 4h7c2.8 0 5-2.2 5-5s-2.2-5-5-5-2.2 0-5 2.2-5 5" />
        </BaseIcon>
    ),
    // --- Google Ecosystem ---
    googleSheets: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
            <path d="M8 12h8v2H8zm0 4h8v2H8z" />
        </BaseIcon>
    ),
    // --- Productivity & CRM ---
    salesforce: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M17.1 11.3c.6-3.4-1.9-6.3-5.1-6.3-1.4 0-2.8.6-3.8 1.6C7.5 5.5 6.4 5 5 5c-2.8 0-5 2.2-5 5 0 1.9 1.1 3.5 2.7 4.4C2.5 15.1 2 16 2 17c0 2.2 1.8 4 4 4h11c2.8 0 5-2.2 5-5 0-2.3-1.6-4.3-3.8-4.8.1-.3.1-.6.1-.9z" />
        </BaseIcon>
    ),
    hubspot: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" /> {/* Placeholder Triangle */}
        </BaseIcon>
    ),
    zendesk: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 8H7V9h5v6zm7-2h-5V9h5v4z" />
        </BaseIcon>
    ),
    shopify: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 17H5V8h14v12h-7z" />
        </BaseIcon>
    ),
    airtable: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2L2 6v12l10 4 10-4V6L12 2zm0 2.5L18.5 7 12 9.5 5.5 7 12 4.5zM4 8.5l8 3 8-3v9l-8 3-8-3v-9z" />
        </BaseIcon>
    ),
    trello: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 15H7V5h5v12zm7-5h-5V5h5v7z" />
        </BaseIcon>
    ),
    asana: (props: IconProps) => (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="2.5" />
            <circle cx="17" cy="12" r="2.5" />
            <circle cx="7" cy="12" r="2.5" />
        </BaseIcon>
    ),
    jira: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M11.5 10.5 9 13l2.5 2.5L14 13l-2.5-2.5zm-5 5L4 18l2.5 2.5L9 18l-2.5-2.5zm10 0L14 18l2.5 2.5L19 18l-2.5-2.5z" />
        </BaseIcon>
    ),
    // --- Cloud & Infra ---
    aws: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
        </BaseIcon>
    ),
    azure: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M4 18h16l-8-14-8 14z" />
        </BaseIcon>
    ),
    azureAi: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M4 18h16l-8-14-8 14z" />
        </BaseIcon>
    ),
    firebase: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2L9 8l3 6 3-6-3-6z" />
        </BaseIcon>
    ),
    s3: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </BaseIcon>
    ),
    lambda: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />
        </BaseIcon>
    ),
    postgreSQL: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.1 5.39z" />
        </BaseIcon>
    ),
    gitLab: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M22.65 14.39L19.5 4.86a.85.85 0 0 0-1.61 0L15.3 12H8.7L6.11 4.86a.85.85 0 0 0-1.61 0L1.35 14.39a.85.85 0 0 0 .3 1l10.35 7.53 10.35-7.53a.85.85 0 0 0 .3-1z" />
        </BaseIcon>
    ),
    // --- Utilities & Messaging ---
    twilio: (props: IconProps) => (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="5" fill="currentColor" className="text-black/50" />
        </BaseIcon>
    ),
    dropbox: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M7 2L1 7l6 5 6-5-6-5zm10 0l-6 5 6 5 6-5-6-5zM1 17l6 5 6-5-6-5-6 5zm16 5l6-5-6-5-6 5 6 5zM7 13.1l-6 3.9 6 5 6-5-6-3.9z" />
        </BaseIcon>
    ),
    payPal: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.3-13h-2.1l-1.9 4.3L6.4 7H4.3l3.5 6.4-1.9 4.3h2.1l1.9-4.3 1.9 4.3h2.1l-3.5-6.4 1.9-4.3z" />
        </BaseIcon>
    ),
    razorpay: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M13 3 5 14h6l-2 7 9-11h-6l2-7z" />
        </BaseIcon>
    ),
    // --- Placeholders & Generic ---
    webhook: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
        </BaseIcon>
    ),
    httpRequest: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7v6H5V6h6l1 2h6v6z" />
        </BaseIcon>
    ),
    claude: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </BaseIcon>
    ),
    user: (props: IconProps) => (
        <BaseIcon {...props} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </BaseIcon>
    ),
    queue: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </BaseIcon>
    ),
    email: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </BaseIcon>
    ),
    sms: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />
        </BaseIcon>
    ),
    googleCalendar: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
        </BaseIcon>
    ),
    microsoftCalendar: (props: IconProps) => (
        <BaseIcon {...props}>
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
        </BaseIcon>
    )
};
