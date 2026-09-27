import { calcPayroll } from '../utils/payrollCalc.js';

describe('Payroll Calculation', () => {
  it('should calculate gross and net salary correctly', () => {
    const result = calcPayroll(50000, 10000, 5000);
    expect(result.grossSalary).toBe(60000); // 50000 + 10000
    expect(result.netSalary).toBe(55000); // 60000 - 5000
  });

  it('should handle zero values properly', () => {
    const result = calcPayroll(0, 0, 0);
    expect(result.grossSalary).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  it('should not allow negative gross salary', () => {
    const result = calcPayroll(-1000, -2000, 0);
    expect(result.grossSalary).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  it('should not allow negative net salary if deductions exceed gross', () => {
    const result = calcPayroll(10000, 5000, 20000);
    expect(result.grossSalary).toBe(15000);
    expect(result.netSalary).toBe(0);
  });
});
