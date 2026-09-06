using System;
using System.Collections.Generic;

namespace GymApp.Api.Models;

public partial class Employee
{
    public int Id { get; set; }

    public string LastName { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string? Patronymic { get; set; }

    public string? Phone { get; set; }

    public bool? IsActive { get; set; }

    public virtual SystemUser? SystemUser { get; set; }
    public EmployeePosition Position { get; set; }
    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
