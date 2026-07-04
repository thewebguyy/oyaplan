import { IdentityState } from './sessionResolver';

export type Permission = 
  | 'submit_price_evidence'
  | 'submit_price_flag'
  | 'save_plan'
  | 'moderate_evidence'
  | 'view_admin_portal'
  | 'claim_venue';

export class RoleService {
  /**
   * Policy-driven RBAC evaluation.
   * Centralizes all authorization logic into a single readable function.
   */
  static can(identity: IdentityState, permission: Permission): boolean {
    if (identity.type === 'anonymous') return false;
    
    const role = identity.profile.role;
    
    // Admins can do everything
    if (role === 'admin') return true;

    switch (permission) {
      case 'save_plan':
        return role === 'planner' || role === 'scout' || role === 'venue_operator';
      
      case 'submit_price_evidence':
      case 'submit_price_flag':
        return role === 'scout';

      case 'claim_venue':
        return role === 'venue_operator';

      case 'moderate_evidence':
      case 'view_admin_portal':
        return false; // already checked admin above
        
      default:
        return false;
    }
  }
}
