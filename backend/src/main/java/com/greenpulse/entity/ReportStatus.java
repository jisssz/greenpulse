package com.greenpulse.entity;

public enum ReportStatus {
    SUBMITTED,
    UNDER_REVIEW,
    VERIFIED,
    REJECTED,
    DUPLICATE,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    RESOLUTION_VERIFICATION,
    CLOSED;

    public boolean canTransitionTo(ReportStatus newStatus, Role role) {
        if (this == newStatus) return true;
        
        switch (this) {
            case SUBMITTED:
                return newStatus == UNDER_REVIEW || newStatus == VERIFIED || newStatus == REJECTED || newStatus == DUPLICATE;
            case UNDER_REVIEW:
                return newStatus == VERIFIED || newStatus == REJECTED || newStatus == DUPLICATE;
            case VERIFIED:
                return newStatus == ASSIGNED || newStatus == IN_PROGRESS || newStatus == REJECTED;
            case ASSIGNED:
                return newStatus == IN_PROGRESS || newStatus == REJECTED || newStatus == ASSIGNED;
            case IN_PROGRESS:
                return newStatus == RESOLVED || newStatus == VERIFIED;
            case RESOLVED:
                return newStatus == RESOLUTION_VERIFICATION || newStatus == CLOSED || newStatus == VERIFIED;
            case RESOLUTION_VERIFICATION:
                return newStatus == CLOSED || newStatus == VERIFIED;
            case REJECTED:
            case DUPLICATE:
                return newStatus == UNDER_REVIEW || newStatus == SUBMITTED;
            case CLOSED:
                return false;
            default:
                return false;
        }
    }
}
