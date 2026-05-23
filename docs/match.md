# FinWave Match Report

Scope: comparison of the current codebase against [Group20_SRS.pdf](Group20_SRS.pdf) and [FinWave_Comprehensive_Test_Cases_Team20.xlsx](FinWave_Comprehensive_Test_Cases_Team20.xlsx).

## Overall Verdict

The current repository is a solid hackathon MVP, but it does not fully match the SRS or the test-case workbook. The implementation currently behaves like a phone-first FinLink prototype with real transfers, wallet persistence, notifications, AI insights, and a blockchain-style audit trail. The SRS and test cases describe a broader FinWave product with Firebase OTP, password-based JWT auth, 10-language support, admin tools, PWA push notifications, stricter security controls, and richer AI / FX / KYC flows.

## Present In The Current MVP

| Area | Status | Evidence |
|---|---|---|
| Phone-first sign-in and persisted session | Present | Phone-based login, stored session, and restored wallet state are implemented in the frontend and backend. |
| Automatic wallet creation | Present | New phone sign-in creates the wallet and profile flow. |
| Wallet dashboard | Present | Balance, summary cards, recent activity, and profile data are shown. |
| Zero-fee transfer flow | Present | Transfer endpoint applies zero service fee and updates both balances. |
| Recipient lookup by phone | Present | Phone-based recipient preview is supported. |
| Transaction history | Present | User can view sent and received transactions. |
| Blockchain-style verification | Present | Each transaction stores a hash chain entry and the UI exposes verification. |
| AI insight generation | Present | Insights are generated with Groq-backed dynamic analysis and fallback behavior. |
| Notifications | Present | Transfers and AI insight events create in-app notifications. |
| Multilingual UI | Present | English, Hindi, and Marathi are available. |
| Mobile-first navigation | Present | Bottom navigation and responsive cards are implemented. |
| AWS deployment artifact | Present | A CloudFormation template exists in the repo. |

## Partial Match

| SRS Area | Status | Why It Is Partial |
|---|---|---|
| FR-1 Authentication | Partial | The app now uses email OTP plus JWT access/refresh tokens, but Firebase Phone OTP, password auth, logout-all, device checks, and lockout policies are still not fully implemented. |
| FR-2 Wallet Management | Partial | Wallets exist and balances update atomically, but only one currency is used in practice and there is no FX display layer. |
| FR-3 Transactions | Partial | Domestic phone-to-phone transfer works, but paginated history, status lifecycle, reversal saga, and email recipient support are not implemented. |
| FR-4 AI Recommendation Engine | Partial | AI insights exist, but category breakdowns, 24-hour cache guarantees, anonymized payload shaping, micro-investment suggestions, and savings goals are incomplete or missing. |
| FR-5 User Management | Partial | Basic profile data exists, but password change, KYC document upload, beneficiary management, and account deactivation are missing. |
| FR-6 Language Management | Partial | Only English, Hindi, and Marathi are available; browser locale detection, Arabic/Urdu RTL, and the full 10-language set are missing. |
| FR-7 Notifications | Partial | In-app notifications exist, but push notifications and notification preferences are not implemented. |
| FR-8 Security | Partial | JWT bearer protection and auth-event logging are present, but rate limiting, HTTPS redirect, refresh-token revocation, device checks, and lockout enforcement are incomplete. |
| FR-9 Admin Functionalities | Partial | No admin dashboard or admin moderation tools exist in the current MVP. |
| UI/UX Requirements | Partial | The interface is mobile-first and visually improved, but accessibility, voice input, QR sharing, simplified mode, and left-sidebar desktop navigation are not complete. |
| Cloud & Deployment | Partial | The repo includes deployment support, but it does not exactly mirror the SRS stack naming and hosting combination. |

## Missing From The Current MVP

| Missing Capability | Related SRS / Test Cases |
|---|---|
| Firebase OTP registration and verification flow | FR-1.1, FR-1.2, FR-1.3, TC-AUTH-001, TC-AUTH-002, TC-AUTH-003, TC-AUTH-005, TC-EDGE-004 |
| Password-based auth with JWT access and refresh tokens | FR-1.4, FR-1.5, FR-1.6, FR-1.8, TC-AUTH-004, TC-AUTH-006, TC-AUTH-007, TC-API-002 |
| Multiple currency support and FX display | FR-2.2, FR-2.3, FR-2.4, TC-WALLET-003, TC-EDGE-003 |
| Email recipient support and paginated/filterable transfer history | FR-3.1, FR-3.8, TC-TXN-001, TC-EDGE-005 |
| Transaction reversal saga | FR-3.9, TC-INT-001 |
| 8-category insight classification with monthly totals pie chart | FR-4.1, TC-AI-001 |
| 24-hour insight cache | FR-4.3, TC-API-003, TC-REG-003 |
| Anonymous AI payloads with no raw PII | FR-4.4, TC-INT-004 |
| Micro-investment recommendations and savings goals | FR-4.6, FR-4.7 |
| Password change flow and beneficiary management | FR-5.2, FR-5.4, TC-PROFILE-001, TC-PROFILE-002 |
| KYC document upload and approval workflow | FR-5.3, FR-9.5, TC-ADMIN-001, TC-ADMIN-002 |
| Full 10-language support with browser locale detection | FR-6.1, FR-6.2, FR-6.4, FR-6.5, TC-LANG-001, TC-LANG-002 |
| PWA push notifications and preferences | FR-7.2, FR-7.4 |
| Rate limiting, HTTPS redirect, auth logs, and lockout | FR-8.2, FR-8.4, FR-8.5, FR-8.6, TC-SEC-003, TC-SEC-005 |
| Admin dashboard, user management, and analytics | FR-9.1 through FR-9.6, TC-ADMIN-001, TC-ADMIN-002, TC-RBAC-001, TC-RBAC-002, TC-RBAC-003 |
| Accessibility extras such as voice input, QR payment sharing, and simplified mode | UI/UX 9.4 |

## Test-Case Alignment

### Likely Covered Or Mostly Covered Now

| Test Case | Match |
|---|---|
| TC-WALLET-002 Wallet balance updated after receiving transfer | Yes, the current transfer flow updates both wallets. |
| TC-TXN-001 Successful domestic transfer | Yes, the backend supports completed transfers with zero fees. |
| TC-TXN-002 Blockchain hash generated for completed transaction | Yes, the transaction stores a blockchain-style hash entry. |
| TC-NOTIF-001 In-app notification on transaction completion | Yes, notifications are created on transfer completion. |
| TC-LANG-001 Language switch to Hindi without re-login | Yes, English/Hindi/Marathi switching is present. |
| TC-UI-001 Dashboard renders correctly on mobile | Yes, the UI is mobile-first and responsive. |
| TC-UI-003 Color-coded transaction status badges visible | Yes, transaction cards render status and direction styling. |
| TC-API-001 POST /transactions/send returns a transaction object | Mostly yes, but the current endpoint naming is different from the workbook's /transactions/send wording. |
| TC-INT-003 End-to-end transfer flow with notification delivery | Mostly yes, the transfer and notification chain exists. |

### Partial Matches

| Test Case | Gap |
|---|---|
| TC-AI-001 AI insights for user with 5+ transactions | Insight generation exists, but the workbook expects a richer 8-category pie chart and more structured recommendation output. |
| TC-SEC-002 Access protected endpoint without JWT | Protected endpoints now use JWT bearer tokens; deeper refresh-token revocation and lockout behavior are still missing. |
| TC-API-002 All protected endpoints require authorization header | Protection exists, but the auth mechanism does not match the workbook's JWT bearer token pattern. |
| TC-EDGE-005 Transaction history pagination boundary | Current history is not paginated. |
| TC-REG-001 / TC-REG-002 / TC-REG-003 | Regression scenarios are not fully represented because several target features do not exist yet. |

### Not Covered Yet

| Test Case Group | Reason |
|---|---|
| Authentication OTP / password / lockout cases | The current MVP does not implement Firebase OTP, password strength, refresh tokens, or lockout logic. |
| Admin and RBAC cases | No admin dashboard or admin-only control surfaces are present. |
| FX and unsupported currency cases | The app uses a single working currency path and does not expose multi-currency logic. |
| PWA and push notification cases | Push channel and service worker behavior are not implemented. |
| RTL and Arabic/Urdu layout cases | RTL support is not implemented. |
| Security deep cases such as rate limiting and auth logging | These controls are not fully present in the current backend. |

## Practical Gap Summary

The strongest matches are wallet creation, wallet-to-wallet transfers, transaction history, blockchain-style hashes, notifications, and multilingual phone-first UX. The biggest gaps are the SRS authentication model, broader language coverage, admin tooling, currency/FX handling, and the more advanced AI and security requirements that the workbook tests assume.

## Recommended Next Implementation Order

1. Harden the new email OTP + JWT auth model with rate limiting, refresh-token revocation, device checks, and lockout handling.
2. Add the missing security controls: rate limiting, auth event logging, lockout, and HTTPS enforcement.
3. Expand the insights page to cover the workbook expectations: category pie chart, trend chart, and savings recommendation cards.
4. Add pagination/filtering to transaction history and a richer transfer status model.
5. Finish the language and accessibility scope: Arabic/Urdu RTL, browser-locale suggestion, and the remaining UI/UX support features.
