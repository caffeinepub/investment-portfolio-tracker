import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    permanentAddress : Text;
    temporaryAddress : Text;
    contactNumbers : [Text]; // Up to 4 contact numbers
    aadhaarNumber : ?Text;
    panNumber : ?Text;
  };

  type InvestmentCategory = {
    #liquidityHoldings;
    #mutualFunds;
    #stocks;
    #bonds;
    #fixedDepositsNationalized;
    #fixedDepositsCorporate;
    #insuranceHealth;
    #insuranceWealth;
    #insuranceAsset;
    #chits;
    #sebiRegisteredCompanies;
    #cryptocurrency;
    #other;
    #nationalSavings;
    #pensionPrivate;
    #unitLinkedInsurancePlans;
    #debtFunds;
    #seniorCitizenSavingsScheme;
    #realEstateInvestmentTrusts;
    #sovereignGoldBonds;
    #nationalPensionSystem;
    #publicProvidentFund;
    #equity;
    #silverBonds;
    #postOfficeSchemes;
  };

  type Investment = {
    name : Text;
    category : InvestmentCategory;
    amountInvested : Float.Float;
    currentValue : Float.Float;
    dateOfInvestment : Time.Time;
    notes : ?Text;
    isSEBIRegistered : Bool;
    folioNumber : ?Text;
  };

  type Nominee = {
    nomineePrincipal : Principal;
    name : Text;
    contactInfo : Text;
  };

  // System state keeping filled profile information only
  let userProfiles = Map.empty<Principal, UserProfile>();
  let investments = Map.empty<Principal, [Investment]>();
  let nominees = Map.empty<Principal, Nominee>();

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.contactNumbers.size() > 4) {
      Runtime.trap("Cannot have more than 4 contact numbers");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addInvestment(investment : Investment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage investments");
    };

    let userInvestments = switch (investments.get(caller)) {
      case (null) { [investment] };
      case (?existing) { existing.concat([investment]) };
    };
    investments.add(caller, userInvestments);
  };

  public shared ({ caller }) func updateInvestment(index : Nat, investment : Investment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage investments");
    };

    let userInvestments = switch (investments.get(caller)) {
      case (null) { Runtime.trap("No investments found for user") };
      case (?existing) {
        if (index >= existing.size()) {
          Runtime.trap("Invalid investment index");
        };
        Array.tabulate(
          existing.size(),
          func(i) { if (i == index) { investment } else { existing[i] } },
        );
      };
    };
    investments.add(caller, userInvestments);
  };

  public shared ({ caller }) func deleteInvestment(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage investments");
    };

    let userInvestments = switch (investments.get(caller)) {
      case (null) { Runtime.trap("No investments found for user") };
      case (?existing) {
        if (index >= existing.size()) {
          Runtime.trap("Invalid investment index");
        };
        Array.tabulate(
          existing.size() - 1,
          func(i) {
            if (i < index) { existing[i] } else { existing[i + 1] };
          },
        );
      };
    };
    investments.add(caller, userInvestments);
  };

  private func isNomineeOf(caller : Principal, user : Principal) : Bool {
    switch (nominees.get(user)) {
      case (null) { false };
      case (?nominee) { Principal.equal(nominee.nomineePrincipal, caller) };
    };
  };

  public query ({ caller }) func getInvestments(user : Principal) : async [Investment] {
    if (not (Principal.equal(caller, user) or isNomineeOf(caller, user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Cannot view other user's investments");
    };

    switch (investments.get(user)) {
      case (null) { [] };
      case (?userInvestments) { userInvestments };
    };
  };

  public query ({ caller }) func getTotalInvestmentSummary(user : Principal) : async { totalInvested : Float; totalCurrentValue : Float } {
    if (not (Principal.equal(caller, user) or isNomineeOf(caller, user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Cannot view other user's investment summary");
    };

    switch (investments.get(user)) {
      case (null) { { totalInvested = 0.0; totalCurrentValue = 0.0 } };
      case (?userInvestments) {
        var totalInvested : Float = 0.0;
        var totalCurrentValue : Float = 0.0;
        for (inv in userInvestments.vals()) {
          totalInvested += inv.amountInvested;
          totalCurrentValue += inv.currentValue;
        };
        { totalInvested; totalCurrentValue };
      };
    };
  };

  public shared ({ caller }) func addNominee(nominee : Nominee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage nominees");
    };
    nominees.add(caller, nominee);
  };

  public shared ({ caller }) func updateNominee(nominee : Nominee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage nominees");
    };
    nominees.add(caller, nominee);
  };

  public shared ({ caller }) func removeNominee() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage nominees");
    };
    nominees.remove(caller);
  };

  public query ({ caller }) func getNominee(user : Principal) : async ?Nominee {
    if (not (Principal.equal(caller, user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Cannot view other user's nominee");
    };
    nominees.get(user);
  };

  public query ({ caller }) func getCallerNominee() : async ?Nominee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access nominee information");
    };
    nominees.get(caller);
  };

  // HTTP Outcall to DigiLocker - requires user authentication
  public shared ({ caller }) func fetchAadhaarDetails() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch Aadhaar details");
    };
    await OutCall.httpGetRequest(
      "https://api.digilocker.gov.in/api/v1/fetchAadhaarDetails",
      [],
      transform,
    );
  };

  public shared ({ caller }) func fetchPanDetails() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch PAN details");
    };
    await OutCall.httpGetRequest(
      "https://api.digilocker.gov.in/api/v1/fetchPanDetails",
      [],
      transform,
    );
  };

  public shared ({ caller }) func fetchSoaHoldings() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch SoA holdings");
    };
    
    // Verify the caller has both Aadhaar and PAN in their profile
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        if (profile.aadhaarNumber == null or profile.panNumber == null) {
          Runtime.trap("Both Aadhaar and PAN numbers are required to fetch SoA holdings");
        };
      };
    };

    await OutCall.httpGetRequest(
      "https://soalink.in/api/soa_holdings",
      [],
      transform,
    );
  };
};
