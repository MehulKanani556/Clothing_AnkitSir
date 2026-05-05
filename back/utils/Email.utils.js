import transporter from './Email.config.js';

const BRAND_COLOR = '#14372F';
const GOLD_COLOR = '#D4AF37';
const BG_COLOR = '#FBFBFB';
const TEXT_COLOR = '#2C2C2C';
const LIGHT_TEXT = '#8E8E8E';

const emailLayout = (content) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Urbanist', Arial, sans-serif; margin: 0; padding: 0; background-color: ${BG_COLOR}; color: ${TEXT_COLOR}; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; table-layout: fixed; background-color: ${BG_COLOR}; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0; overflow: hidden; }
            
            /* Header */
            .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0; }
            .logo { font-size: 28px; font-weight: 700; letter-spacing: 5px; color: ${BRAND_COLOR}; text-transform: uppercase; margin: 0; }
            
            /* Hero */
            .hero { background-color: ${BRAND_COLOR}; padding: 60px 40px; text-align: center; color: #ffffff; position: relative; }
            .hero h2 { font-size: 32px; font-weight: 300; margin: 0 0 10px 0; letter-spacing: 1px; }
            .hero p { font-size: 16px; opacity: 0.8; margin: 0; font-weight: 300; }
            .hero-accent { width: 40px; height: 2px; background-color: ${GOLD_COLOR}; margin: 25px auto; }
            
            /* Content Area */
            .content { padding: 50px 40px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${GOLD_COLOR}; margin-bottom: 25px; }
            
            /* Order Info Card */
            .order-info { display: table; width: 100%; border-bottom: 1px solid #f0f0f0; padding-bottom: 30px; margin-bottom: 30px; }
            .order-info-item { display: table-cell; width: 50%; }
            .info-label { display: block; font-size: 11px; color: ${LIGHT_TEXT}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .info-value { display: block; font-size: 15px; font-weight: 600; color: ${BRAND_COLOR}; }
            
            /* Product Table */
            .product-row { padding: 20px 0; border-bottom: 1px solid #f9f9f9; }
            .product-name { font-size: 16px; font-weight: 600; color: ${BRAND_COLOR}; margin-bottom: 4px; }
            .product-meta { font-size: 13px; color: ${LIGHT_TEXT}; }
            .product-price { font-size: 15px; font-weight: 600; text-align: right; }
            
            /* Totals */
            .totals-container { margin-top: 30px; background-color: #fcfcfc; padding: 25px; }
            .total-item { display: table; width: 100%; margin-bottom: 10px; }
            .total-label { display: table-cell; font-size: 14px; color: ${LIGHT_TEXT}; }
            .total-value { display: table-cell; text-align: right; font-size: 14px; font-weight: 600; }
            .grand-total { border-top: 1px solid #eee; margin-top: 15px; padding-top: 15px; }
            .grand-total .total-label { font-size: 18px; color: ${BRAND_COLOR}; font-weight: 700; }
            .grand-total .total-value { font-size: 22px; color: ${BRAND_COLOR}; font-weight: 700; }
            
            /* Footer */
            .footer { padding: 50px 40px; text-align: center; background-color: #ffffff; border-top: 1px solid #f0f0f0; }
            .footer-links { margin-bottom: 30px; }
            .footer-links a { color: ${TEXT_COLOR}; text-decoration: none; font-size: 13px; margin: 0 15px; font-weight: 600; }
            .social-links { margin-bottom: 30px; }
            .social-links img { width: 20px; margin: 0 10px; opacity: 0.6; }
            .copyright { font-size: 11px; color: ${LIGHT_TEXT}; line-height: 1.8; letter-spacing: 0.5px; }
            
            .button-container { text-align: center; margin: 40px 0; }
            .button { display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; padding: 18px 45px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; transition: all 0.3s ease; }
            
            .status-update { border-left: 3px solid ${GOLD_COLOR}; padding-left: 20px; margin: 30px 0; }
            .status-text { font-size: 18px; font-weight: 600; color: ${BRAND_COLOR}; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <p class="logo">EO STUDIO</p>
                </div>
                ${content}
                <div class="footer">
                    <div class="footer-links">
                        <a href="${process.env.FRONTEND_URL || '#'}/shop">SHOP</a>
                        <a href="${process.env.FRONTEND_URL || '#'}/account">ACCOUNT</a>
                        <a href="${process.env.FRONTEND_URL || '#'}/contact">HELP</a>
                    </div>
                    <p class="copyright">
                        &copy; ${new Date().getFullYear()} EO STUDIO. ALL RIGHTS RESERVED.<br>
                        MELBOURNE, AUSTRALIA<br><br>
                        YOU ARE RECEIVING THIS EMAIL BECAUSE YOU MADE A PURCHASE AT EO STUDIO.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
`;

export const sendOrderConfirmationEmail = async (user, order) => {
    try {
        const itemsHtml = order.products?.map(item => `
            <div class="product-row">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <div class="product-name">${item.productId?.title || 'Bespoke Item'}</div>
                            <div class="product-meta">${item.selectedSize ? `SIZE: ${item.selectedSize}` : ''} ${item.variantId?.color ? ` | COLOR: ${item.variantId.color}` : ''}</div>
                            <div class="product-meta">QUANTITY: ${item.quantity}</div>
                        </td>
                        <td width="100" class="product-price">
                            $${item.price?.toFixed(2)}
                        </td>
                    </tr>
                </table>
            </div>
        `).join('') || '';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Thank you for your order - #${order.orderId}`,
            html: emailLayout(`
                <div class="hero">
                    <h2>ORDER CONFIRMED</h2>
                    <p>THANK YOU FOR YOUR PURCHASE, ${user.firstName?.toUpperCase() || 'VALUED CLIENT'}</p>
                    <div class="hero-accent"></div>
                </div>
                <div class="content">
                    <div class="section-title">Order Details</div>
                    <div class="order-info">
                        <div class="order-info-item">
                            <span class="info-label">Reference</span>
                            <span class="info-value">#${order.orderId}</span>
                        </div>
                        <div class="order-info-item">
                            <span class="info-label">Date</span>
                            <span class="info-value">${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div class="section-title">Your Selection</div>
                    ${itemsHtml}

                    <div class="totals-container">
                        <div class="total-item">
                            <span class="total-label">Subtotal</span>
                            <span class="total-value">$${order.billingAmount?.toFixed(2)}</span>
                        </div>
                        <div class="total-item">
                            <span class="total-label">Shipping</span>
                            <span class="total-value">$${order.shippingCost?.toFixed(2) || '25.00'}</span>
                        </div>
                        ${order.discountAmount > 0 ? `
                        <div class="total-item">
                            <span class="total-label">Discount</span>
                            <span class="total-value">-$${order.discountAmount.toFixed(2)}</span>
                        </div>` : ''}
                        <div class="total-item grand-total">
                            <span class="total-label">TOTAL</span>
                            <span class="total-value">$${order.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="button-container">
                        <a href="${process.env.FRONTEND_URL || '#'}/orders/${order._id}" class="button">MANAGE ORDER</a>
                    </div>
                    
                    <p style="text-align: center; color: ${LIGHT_TEXT}; font-size: 13px; font-style: italic;">
                        We are currently preparing your items with the utmost care. You will receive a tracking notification once your package is dispatched.
                    </p>
                </div>
            `)
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Order confirmation email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

export const sendStatusUpdateEmail = async (user, order, status) => {
    try {
        let statusTitle = '';
        let statusDescription = '';
        let buttonText = 'TRACK PACKAGE';
        let statusColor = GOLD_COLOR;

        if (status === 'On the way') {
            statusTitle = 'SHIPPED';
            statusDescription = 'GREAT NEWS. YOUR ORDER IS CURRENTLY EN ROUTE TO YOUR SPECIFIED DESTINATION.';
        } else if (status === 'Delivered') {
            statusTitle = 'DELIVERED';
            statusDescription = 'SUCCESS. YOUR PACKAGE HAS BEEN DELIVERED. WE HOPE YOU ENJOY YOUR NEW PIECES.';
            buttonText = 'ORDER HISTORY';
            statusColor = '#009951';
        } else if (status === 'Cancelled') {
            statusTitle = 'CANCELLED';
            statusDescription = 'NOTICE. YOUR ORDER HAS BEEN CANCELLED. ANY APPLICABLE REFUNDS ARE BEING PROCESSED.';
            buttonText = 'VISIT SHOP';
            statusColor = '#C00F0C';
        } else {
            statusTitle = 'UPDATED';
            statusDescription = `THE STATUS OF YOUR ORDER HAS BEEN UPDATED TO: ${status.toUpperCase()}.`;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Order Status Update - #${order.orderId}`,
            html: emailLayout(`
                <div class="hero">
                    <h2>ORDER ${statusTitle}</h2>
                    <p>A QUICK UPDATE REGARDING YOUR PURCHASE</p>
                    <div class="hero-accent"></div>
                </div>
                <div class="content">
                    <div class="section-title">Status Report</div>
                    <div class="status-update">
                        <div class="status-text">${statusDescription}</div>
                    </div>
                    
                    <div class="order-info">
                        <div class="order-info-item">
                            <span class="info-label">Order Reference</span>
                            <span class="info-value">#${order.orderId}</span>
                        </div>
                        <div class="order-info-item">
                            <span class="info-label">New Status</span>
                            <span class="info-value" style="color: ${statusColor}">${status?.toUpperCase()}</span>
                        </div>
                    </div>

                    <div class="button-container">
                        <a href="${process.env.FRONTEND_URL || '#'}/orders" class="button">${buttonText}</a>
                    </div>
                    
                    <p style="text-align: center; color: ${LIGHT_TEXT}; font-size: 13px;">
                        If you have any inquiries regarding this update, please contact our concierge team at support@eostudio.com
                    </p>
                </div>
            `)
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Status update (${status}) email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};


