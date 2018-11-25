/**
 * An enum that represents attributes a thread may have
 */
export enum ThreadAttributes {

    /** Thread does not have any particular attributes (should not happen in the real world) */
    None = 0,

    /** Thread is unread */
    isUnread = 1 << 0,

    /** Thread is locked */
    isLocked = 1 << 1,

    /** Thread is a normal thread */
    isNormalThread = 1 << 2,

    /** Thread is a sticky thread */
    isStickyThread = 1 << 3,

    /** Thread is an announcement thread */
    isAnnouncementThread = 1 << 4,

    /** Thread is considered hot by phpbb */
    isHot = 1 << 5,
}
