import transporter from './Email.config.js';

export const sendOrderConfirmationEmail = async (user, order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Order Confirmation - #${order.orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1a1a1a;">Order Confirmed!</h2>
                    <p>Hi ${user.firstName || 'Customer'},</p>
                    <p>Thank you for your order! We've received it and are getting it ready for you.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Order ID: #${order.orderId}</p>
                        <p style="margin: 5px 0 0 0;">Total Amount: $${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <p>You can track your order status in your account dashboard.</p>
                    <br>
                    <p>Best regards,<br>EO Studio Team</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Order confirmation email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

export const sendStatusUpdateEmail = async (user, order, status) => {
    try {
        let subject = '';
        let message = '';

        if (status === 'On the way') {
            subject = `Your Order #${order.orderId} is Shipped!`;
            message = `Good news! Your order is on its way. You should receive it soon.`;
        } else if (status === 'Delivered') {
            subject = `Your Order #${order.orderId} has been Delivered!`;
            message = `Your order has been successfully delivered. We hope you love your new items!`;
        } else if (status === 'Cancelled') {
            subject = `Order Cancelled - #${order.orderId}`;
            message = `Your order has been cancelled. If you've already paid, a refund will be processed shortly.`;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1a1a1a;">${subject}</h2>
                    <p>Hi ${user.firstName || 'Customer'},</p>
                    <p>${message}</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Order ID: #${order.orderId}</p>
                        <p style="margin: 5px 0 0 0;">New Status: <span style="color: #4f46e5; font-weight: bold;">${status}</span></p>
                    </div>
                    <p>Thank you for shopping with us!</p>
                    <br>
                    <p>Best regards,<br>EO Studio Team</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Status update (${status}) email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};
