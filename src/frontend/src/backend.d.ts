import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Nominee {
    contactInfo: string;
    name: string;
    nomineePrincipal: Principal;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Investment {
    folioNumber?: string;
    isSEBIRegistered: boolean;
    name: string;
    currentValue: Float;
    notes?: string;
    category: InvestmentCategory;
    amountInvested: Float;
    dateOfInvestment: Time;
}
export type Float = number;
export interface UserProfile {
    permanentAddress: string;
    temporaryAddress: string;
    panNumber?: string;
    aadhaarNumber?: string;
    contactNumbers: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export enum InvestmentCategory {
    cryptocurrency = "cryptocurrency",
    mutualFunds = "mutualFunds",
    stocks = "stocks",
    unitLinkedInsurancePlans = "unitLinkedInsurancePlans",
    pensionPrivate = "pensionPrivate",
    postOfficeSchemes = "postOfficeSchemes",
    seniorCitizenSavingsScheme = "seniorCitizenSavingsScheme",
    other = "other",
    fixedDepositsNationalized = "fixedDepositsNationalized",
    chits = "chits",
    fixedDepositsCorporate = "fixedDepositsCorporate",
    sebiRegisteredCompanies = "sebiRegisteredCompanies",
    silverBonds = "silverBonds",
    nationalSavings = "nationalSavings",
    sovereignGoldBonds = "sovereignGoldBonds",
    realEstateInvestmentTrusts = "realEstateInvestmentTrusts",
    insuranceAsset = "insuranceAsset",
    bonds = "bonds",
    insuranceWealth = "insuranceWealth",
    insuranceHealth = "insuranceHealth",
    equity = "equity",
    nationalPensionSystem = "nationalPensionSystem",
    liquidityHoldings = "liquidityHoldings",
    debtFunds = "debtFunds",
    publicProvidentFund = "publicProvidentFund"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInvestment(investment: Investment): Promise<void>;
    addNominee(nominee: Nominee): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteInvestment(index: bigint): Promise<void>;
    fetchAadhaarDetails(): Promise<string>;
    fetchPanDetails(): Promise<string>;
    fetchSoaHoldings(): Promise<string>;
    getCallerNominee(): Promise<Nominee | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInvestments(user: Principal): Promise<Array<Investment>>;
    getNominee(user: Principal): Promise<Nominee | null>;
    getTotalInvestmentSummary(user: Principal): Promise<{
        totalInvested: number;
        totalCurrentValue: number;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeNominee(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateInvestment(index: bigint, investment: Investment): Promise<void>;
    updateNominee(nominee: Nominee): Promise<void>;
}
