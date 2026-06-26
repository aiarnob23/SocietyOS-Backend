export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>
`;