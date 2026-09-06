using System;
using System.Collections.Generic;

namespace GymApp.Api.Models;

public partial class Client
{
    public int Id { get; set; }

    public string LastName { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string? Patronymic { get; set; }

    public string Phone { get; set; } = null!;

    public string? Email { get; set; }

    public DateTime? RegistrationDate { get; set; }

    public bool? IsDeleted { get; set; }
    public ClientStatus Status { get; set; }

    public virtual ICollection<Membership> Memberships { get; set; } = new List<Membership>();
}
