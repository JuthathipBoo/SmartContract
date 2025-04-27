// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PayrollSystem {
    address public owner;
    uint256 public payrollPeriod; // ระยะเวลาในการจ่าย เช่น ทุกเดือน
    mapping(address => uint256) public salaries; // แผนที่สำหรับเก็บข้อมูลเงินเดือนของพนักงาน
    mapping(address => uint256) public lastPaid; // แผนที่สำหรับเก็บวันที่ที่จ่ายเงินล่าสุดให้กับพนักงาน
    address[] public employeeList;

    event Paid(address indexed employee, uint256 amount);

    constructor(uint256 _payrollPeriod) {
        owner = msg.sender;
        payrollPeriod = _payrollPeriod; // รับระยะเวลาจาก constructor เช่น 30 วัน
    }

    // ฟังก์ชันสำหรับเพิ่มพนักงานและจ่ายเงินก้อนแรกทันที
    function addEmployeeAndPayFirst(address employee, uint256 salary) public {
        require(
            msg.sender == owner,
            "You must be the owner to add an employee"
        );
        require(employee != address(0), "Invalid employee address");
        require(salary > 0, "Salary must be greater than 0");
        require(salaries[employee] == 0, "Employee already exists");

        salaries[employee] = salary;
        lastPaid[employee] = block.timestamp;
        employeeList.push(employee); // ⭐ เพิ่มบันทึก address เข้าไปใน list

        require(
            address(this).balance >= salary,
            "Not enough balance to pay first salary"
        );
        payable(employee).transfer(salary);

        emit Paid(employee, salary);
    }

    // ฟังก์ชันใหม่เพื่อดึงรายชื่อพนักงานทั้งหมด
    function getEmployees() public view returns (address[] memory) {
        return employeeList;
    }

    // ฟังก์ชันจ่ายเงินเดือนรอบปกติ
    function paySalary(address employee) public {
        require(msg.sender == owner, "You must be the owner to pay salary");
        uint256 salary = salaries[employee];
        require(salary > 0, "Employee has no salary set");

        uint256 currentPeriod = block.timestamp - lastPaid[employee];
        require(currentPeriod >= payrollPeriod, "Not yet time to pay salary");

        require(
            address(this).balance >= salary,
            "Not enough balance to pay salary"
        );
        payable(employee).transfer(salary);

        lastPaid[employee] = block.timestamp;

        emit Paid(employee, salary);
    }

    function fundPayroll() public payable {
        require(msg.sender == owner, "You must be the owner to fund payroll");
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
