using Moq;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using MaintenanceWarrantySystem.Domain.Entities;
using Xunit;

namespace MaintenanceWarrantySystem.Api.Tests.UnitTests;

public class WarrantyClaimServiceTests : IDisposable
{
    private readonly Mock<IWarrantyClaimRepository> _mockRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly WarrantyClaimService _service;

    public WarrantyClaimServiceTests()
    {
        _mockRepository = new Mock<IWarrantyClaimRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _service = new WarrantyClaimService(_mockRepository.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsClaim_WhenClaimExists()
    {
        // Arrange
        var claimId = 1;
        var claim = new WarrantyClaim
        {
            Id = claimId,
            DeviceId = 1,
            Description = "Test claim",
            IssueDate = DateTime.Now,
            Status = "Open"
        };
        _mockRepository.Setup(r => r.GetByIdAsync(claimId)).ResultAsync(claim);

        // Act
        var result = await _service.GetByIdAsync(claimId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(claimId, result.Id);
        Assert.Equal("Test claim", result.Description);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenClaimDoesNotExist()
    {
        // Arrange
        var claimId = 999;
        _mockRepository.Setup(r => r.GetByIdAsync(claimId)).ReturnsAsync((WarrantyClaim?)null);

        // Act
        var result = await _service.GetByIdAsync(claimId);

        // Assert
        Assert.Null(result);
    }

    public void Dispose()
    {
        // Cleanup
    }
}
