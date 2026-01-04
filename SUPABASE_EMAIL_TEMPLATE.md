# Supabase Email Template Configuration

## Instructions

To customize the authentication email in Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. Select **Magic Link** template
5. Replace the default template with the HTML provided below
6. Click **Save**

## Magic Link Email Template

Copy and paste this HTML template into the Supabase Email Template editor:

```html
<h2>Access to Technical Test</h2>

<p>Hello,</p>

<p>You have requested access to Oriol Claramunt's technical test for the ASO/ASA Manager position at Aristocrat.</p>

<p>Click the button below to sign in to the test platform:</p>

<p><a href="{{ .ConfirmationURL }}">Sign In to Technical Test</a></p>

<p>Alternatively, you can copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>Important:</strong> This link will expire in 1 hour.</p>

<p>If you did not request this access, please ignore this email.</p>

<p>Best regards,<br>
<strong>Aristocrat</strong><br>
Technical Test Platform</p>
```

## Alternative Rich HTML Template (Recommended)

For a more professional, branded appearance, use this HTML template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access to Technical Test</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Aristocrat</h1>
                            <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px; font-weight: 500;">Technical Test Platform</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Access to Technical Test</h2>
                            
                            <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px;">Hello,</p>
                            
                            <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px;">You have requested access to <strong>Oriol Claramunt's technical test</strong> for the <strong>ASO/ASA Manager</strong> position at Aristocrat.</p>
                            
                            <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px;">Click the button below to sign in to the test platform:</p>
                            
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">Sign In to Technical Test</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">Alternatively, you can copy and paste this link into your browser:</p>
                            <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f1f5f9; border-radius: 4px; word-break: break-all; color: #475569; font-size: 13px; font-family: 'Courier New', monospace;">{{ .ConfirmationURL }}</p>
                            
                            <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 24px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ Important:</p>
                                <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">This link will expire in <strong>1 hour</strong> for security purposes.</p>
                            </div>
                            
                            <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px;">If you did not request this access, please ignore this email.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Best regards,</p>
                            <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Aristocrat</strong> - Technical Test Platform</p>
                            <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Subject Line

Set the email subject to:

```
Access to Technical Test - Aristocrat
```

Or:

```
Sign In to Oriol Claramunt's Technical Test
```

## Template Variables

Supabase provides these variables you can use:
- `{{ .ConfirmationURL }}` - The magic link URL
- `{{ .Token }}` - The token (usually not needed)
- `{{ .TokenHash }}` - The token hash (usually not needed)
- `{{ .RedirectTo }}` - The redirect URL

## Notes

- The template uses Aristocrat's purple brand colors (#667eea, #764ba2)
- All text is in English as requested
- No mentions of Supabase are included
- The template is mobile-responsive
- The link expires in 1 hour (default Supabase setting)

## Testing

After saving the template:
1. Go to your login page
2. Request a magic link
3. Check your email to verify the new design
4. Test the link to ensure it works correctly
