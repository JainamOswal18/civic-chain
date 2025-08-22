address civic_issues {
module civic_issues {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;

    // Status constants
    const PENDING_VERIFICATION: u8 = 0;
    const VERIFIED: u8 = 1;
    const ACKNOWLEDGED: u8 = 2;
    const IN_PROGRESS: u8 = 3;
    const COMPLETED: u8 = 4;
    const PENDING_COMPLETION_VERIFICATION: u8 = 5;
    const FULLY_RESOLVED: u8 = 6;
    const SPAM: u8 = 7;

    // Voting thresholds
    const CONFIRM_THRESHOLD: u64 = 3;
    const SPAM_THRESHOLD: u64 = 3;
    const RESOLVED_THRESHOLD: u64 = 3;
    const NOT_RESOLVED_THRESHOLD: u64 = 3;

    /// Represents a civic issue report
    struct Issue has store, copy, drop {
        id: u64,
        reporter: address,
        ward: u8,
        category: String,
        description: String,
        latitude: String,
        longitude: String,
        status: u8,
        confirm_votes: u64,
        spam_votes: u64,
        initial_voters: vector<address>,
        resolved_votes: u64,
        not_resolved_votes: u64,
        completion_voters: vector<address>,
        created_at: u64,
        updated_at: u64,
        completed_at: u64
    }

    /// Registry holding all issues
    struct CivicRegistry has key {
        issues: vector<Issue>,
        next_issue_id: u64
    }

    /// Ward Councillor registration
    struct WardCouncillor has key {
        ward: u8,
        is_active: bool
    }

    /// New: Stores ward location data
    struct WardInfo has store, copy, drop {
        ward: u8,
        latitude: String,
        longitude: String,
        is_active: bool
    }

    /// Registry for ward infos
    struct WardRegistry has key {
        wards: vector<WardInfo>
    }

     /// Initialize ward registry (call once)
    public entry fun initialize_ward_registry(admin: &signer) {
        move_to(admin, WardRegistry {
            wards: vector::empty<WardInfo>()
        });
    }

    /// Register or update a ward's coordinates
    public entry fun register_ward(
        admin: &signer,
        ward: u8,
        latitude: String,
        longitude: String
    ) acquires WardRegistry {
        let registry = borrow_global_mut<WardRegistry>(@civic_issues);
        let len = vector::length(&registry.wards);
        let i = 0;
        // If exists, update
        while (i < len) {
            let info = vector::borrow_mut(&mut registry.wards, i);
            if (info.ward == ward) {
                info.latitude = latitude;
                info.longitude = longitude;
                info.is_active = true;
                return
            };
            i = i + 1;
        };
        // Otherwise add new
        let info = WardInfo {
            ward,
            latitude,
            longitude,
            is_active: true
        };
        vector::push_back(&mut registry.wards, info);
    }


    /// Initialize the registry (call once)
    public entry fun initialize_registry(account: &signer) {
        move_to(account, CivicRegistry {
            issues: vector::empty<Issue>(),
            next_issue_id: 0
        });
    }

    /// Register a ward councillor for a ward
    public entry fun register_councillor(account: &signer, ward: u8) {
        move_to(account, WardCouncillor {
            ward,
            is_active: true
        });
    }

    /// Citizen reports a new issue
    public entry fun report_issue(
        reporter: &signer,
        ward: u8,
        category: String,
        description: String,
        latitude: String,
        longitude: String
    ) acquires CivicRegistry {
        let registry = borrow_global_mut<CivicRegistry>(@civic_issues);
        let issue_id = registry.next_issue_id;
        let now = timestamp::now_seconds();

        let issue = Issue {
            id: issue_id,
            reporter: signer::address_of(reporter),
            ward,
            category,
            description,
            latitude,
            longitude,
            status: PENDING_VERIFICATION,
            confirm_votes: 0,
            spam_votes: 0,
            initial_voters: vector::empty<address>(),
            resolved_votes: 0,
            not_resolved_votes: 0,
            completion_voters: vector::empty<address>(),
            created_at: now,
            updated_at: now,
            completed_at: 0
        };

        vector::push_back(&mut registry.issues, issue);
        registry.next_issue_id = issue_id + 1;
    }

    /// Community votes to confirm or flag spam
    public entry fun vote_on_issue(
        voter: &signer,
        issue_id: u64,
        is_confirm: bool
    ) acquires CivicRegistry {
        let registry = borrow_global_mut<CivicRegistry>(@civic_issues);
        let voter_addr = signer::address_of(voter);

        let len = vector::length(&registry.issues);
        let i = 0;
        while (i < len) {
            let issue = vector::borrow_mut(&mut registry.issues, i);
            if (issue.id == issue_id && issue.status == PENDING_VERIFICATION) {
                assert!(!vector::contains(&issue.initial_voters, &voter_addr), 1);

                vector::push_back(&mut issue.initial_voters, voter_addr);
                if (is_confirm) {
                    issue.confirm_votes = issue.confirm_votes + 1;
                    if (issue.confirm_votes >= CONFIRM_THRESHOLD) {
                        issue.status = VERIFIED;
                        issue.updated_at = timestamp::now_seconds();
                    }
                } else {
                    issue.spam_votes = issue.spam_votes + 1;
                    if (issue.spam_votes >= SPAM_THRESHOLD) {
                        issue.status = SPAM;
                        issue.updated_at = timestamp::now_seconds();
                    }
                };
                break
            };
            i = i + 1;
        }
    }

    /// Councillor updates issue status (Acknowledged, In Progress, Completed)
    public entry fun update_issue_status(
        councillor: &signer,
        issue_id: u64,
        new_status: u8
    ) acquires CivicRegistry, WardCouncillor {
        let ward_info = borrow_global<WardCouncillor>(signer::address_of(councillor));
        let registry = borrow_global_mut<CivicRegistry>(@civic_issues);

        let len = vector::length(&registry.issues);
        let i = 0;
        while (i < len) {
            let issue = vector::borrow_mut(&mut registry.issues, i);
            if (issue.id == issue_id && issue.ward == ward_info.ward) {
                if (new_status == COMPLETED) {
                    issue.status = PENDING_COMPLETION_VERIFICATION;
                    issue.completed_at = timestamp::now_seconds();
                } else {
                    issue.status = new_status;
                };
                issue.updated_at = timestamp::now_seconds();
                break
            };
            i = i + 1;
        }
    }

    /// Community votes on completion (resolved/not resolved)
    public entry fun vote_on_completion(
        voter: &signer,
        issue_id: u64,
        is_resolved: bool
    ) acquires CivicRegistry {
        let registry = borrow_global_mut<CivicRegistry>(@civic_issues);
        let voter_addr = signer::address_of(voter);

        let len = vector::length(&registry.issues);
        let i = 0;
        while (i < len) {
            let issue = vector::borrow_mut(&mut registry.issues, i);
            if (issue.id == issue_id && issue.status == PENDING_COMPLETION_VERIFICATION) {
                assert!(!vector::contains(&issue.completion_voters, &voter_addr), 3);
                vector::push_back(&mut issue.completion_voters, voter_addr);

                if (is_resolved) {
                    issue.resolved_votes = issue.resolved_votes + 1;
                    if (issue.resolved_votes >= RESOLVED_THRESHOLD) {
                        issue.status = FULLY_RESOLVED;
                        issue.updated_at = timestamp::now_seconds();
                    }
                } else {
                    issue.not_resolved_votes = issue.not_resolved_votes + 1;
                    if (issue.not_resolved_votes >= NOT_RESOLVED_THRESHOLD) {
                        issue.status = IN_PROGRESS;
                        issue.updated_at = timestamp::now_seconds();
                        issue.resolved_votes = 0;
                        issue.not_resolved_votes = 0;
                        issue.completion_voters = vector::empty<address>();
                    }
                };
                break
            };
            i = i + 1;
        }
    }

    /// View functions

     /// View wards' info
    #[view]
    public fun get_all_wards(): vector<WardInfo> acquires WardRegistry {
        borrow_global<WardRegistry>(@civic_issues).wards
    }
    
    #[view] public fun get_all_issues(): vector<Issue> acquires CivicRegistry {
        if (!exists<CivicRegistry>(@civic_issues)) {
            return vector::empty<Issue>()
        };
        borrow_global<CivicRegistry>(@civic_issues).issues
    }

    #[view] public fun get_issues_by_ward(ward: u8): vector<Issue> acquires CivicRegistry {
        let result = vector::empty<Issue>();
        if (exists<CivicRegistry>(@civic_issues)) {
            let registry = borrow_global<CivicRegistry>(@civic_issues);
            let len = vector::length(&registry.issues);
            let i = 0;
            while (i < len) {
                let issue = *vector::borrow(&registry.issues, i);
                if (issue.ward == ward) {
                    vector::push_back(&mut result, issue);
                };
                i = i + 1;
            }
        };
        result
    }
}
}   