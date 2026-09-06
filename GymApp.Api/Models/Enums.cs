using NpgsqlTypes;

namespace GymApp.Api.Models;

public enum ClientStatus
{
    [PgName("active")]
    Active,
    [PgName("inactive")]
    Inactive,
    [PgName("blacklisted")]
    Blacklisted
}

public enum MembershipType
{
    [PgName("single")]
    Single,
    [PgName("month")]
    Month,
    [PgName("year")]
    Year
}

public enum MembershipStatus
{
    [PgName("active")]
    Active,
    [PgName("completed")]
    Completed,
    [PgName("expired")]
    Expired,
    [PgName("cancelled")]
    Cancelled
}

public enum SystemRole
{
    [PgName("admin")]
    Admin,
    [PgName("operator")]
    Operator
}

public enum EmployeePosition
{
    [PgName("administrator")]
    Administrator,
    [PgName("trainer")]
    Trainer,
    [PgName("manager")]
    Manager,
    [PgName("director")]
    Director,
    [PgName("cleaner")]
    Cleaner
}