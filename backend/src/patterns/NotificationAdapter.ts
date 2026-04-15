/**
 * PATTERN: Adapter
 * PROBLEM: Sending order confirmation notifications — the system should not
 *          depend on a specific notification channel. When CAMS goes live,
 *          the owner can plug in any notification channel without changing core logic.
 * PARTICIPANTS:
 *   - INotificationService (target interface)
 *   - InAppNotificationAdapter (primary adapter)
 *   - EmailAdapter (secondary adapter — extensible)
 * USED BY: CustomerNotifier (Observer) — sends notifications on order events
 * 
 * SOLID: DIP — OrderService depends on INotificationService, not a concrete adapter
 * SOLID: OCP — new channels are added by creating new adapters, not modifying existing ones
 * SOLID: ISP — INotificationService has only one method: send()
 */

/**
 * INotificationService — the target interface that all notification
 * adapters must implement.
 * 
 * SOLID: ISP — single method, maximum segregation
 */
export interface INotificationService {
  send(to: string, message: string): Promise<void>;
}

/**
 * InAppNotificationAdapter — the primary notification channel for CAMS.
 * Stores notifications in-memory (can be extended to use a DB table).
 * 
 * This is the default adapter used in the system.
 */


  /**
   * Get all notifications for a user (for polling-based retrieval).
   */
  getNotifications(userId: string): Array<{ message: string; timestamp: Date }> {
    return this.notifications
      .filter((n) => n.to === userId)
      .map(({ message, timestamp }) => ({ message, timestamp }));
  }
}

/**
 * EmailAdapter — sends notifications via email.
 * Currently logs to console (placeholder for real email service like nodemailer).
 * 
 * Demonstrates the Adapter pattern: same interface, different implementation.
 * Can be swapped in without changing any code that depends on INotificationService.
 */
export class EmailAdapter implements INotificationService {
  async send(to: string, message: string): Promise<void> {
    // In production, this would use nodemailer or a third-party email API
    // For now, we log to demonstrate the pattern
    console.log(`[Email] Sending email to ${to}: ${message}`);
    // await emailClient.send({ to, subject: 'CAMS Order Update', body: message });
  }
}
