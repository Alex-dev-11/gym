using GymApp.Api.DTOs.Employees;
using GymApp.Api.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymApp.Api.Controllers.Employees;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")] // 👈 Только админ может управлять сотрудниками
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    // GET: api/employees
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _employeeService.GetAllAsync();
        return Ok(employees);
    }

    // GET: api/employees/trainers
    [HttpGet("trainers")]
    [AllowAnonymous] // 👈 Разрешаем всем (например, оператору при создании посещения)
    public async Task<IActionResult> GetActiveTrainers()
    {
        var trainers = await _employeeService.GetActiveTrainersAsync();
        return Ok(trainers);
    }

    // POST: api/employees
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        var created = await _employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    // PUT: api/employees/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var updated = await _employeeService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    // DELETE: api/employees/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _employeeService.DeleteAsync(id);
        return NoContent();
    }
}