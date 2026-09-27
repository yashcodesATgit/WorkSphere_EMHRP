export function calcPayroll(basicSalary = 0, allowances = 0, deductions = 0) {
  const gross = Math.max(0, basicSalary + allowances);
  const net = Math.max(0, gross - deductions);
  return { grossSalary: gross, netSalary: net };
}
