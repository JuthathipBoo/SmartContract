"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// import { Button } from "react-bootstrap";
import { Button } from "react-bootstrap"; // ใช้ Button จาก React-Bootstrap
import { motion } from "framer-motion"; // ใช้ framer-motion สำหรับ Animation
import "bootstrap/dist/css/bootstrap.min.css";
import { FaWallet } from "react-icons/fa"; // เพิ่มไอคอนกระเป๋าเงิน } from "react-icons/fa"; // เพิ่มไอคอนกระเป๋าเงิน

const contractAddress = "0xcad5f9e46c354e2c46994d8958d3dc445dad86ef"; // <-- ใส่ address จริงที่ deploy แล้ว
const payrollSystemABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "employee",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "salary",
        type: "uint256",
      },
    ],
    name: "addEmployeeAndPayFirst",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "fundPayroll",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "employee",
        type: "address",
      },
    ],
    name: "paySalary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_payrollPeriod",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "employee",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Paid",
    type: "event",
  },
  {
    inputs: [],
    name: "contractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "employeeList",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getEmployees",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastPaid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "payrollPeriod",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "salaries",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface Employee {
  wallet: string;
  salary: string;
  lastPaidDay: string;
}

export default function PayrollDashboard() {
  const [employees, setEmployees] = useState<
    { address: string; salary: number; canPay: boolean; dateAdded: string }[]
  >([]);
  const [newEmployee, setNewEmployee] = useState({ address: "", salary: "" });
  //   const [contractBalance, setContractBalance] = useState("");
  const [fundedAmount, setFundedAmount] = useState(0); // ใช้เก็บยอดเงินที่เติมเข้า
  // const [fundAmount, setFundAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, payrollSystemABI, signer);
  };

  async function addEmployeeAndPayFirst(
    employeeAddress: string,
    salary: string
  ) {
    const contract = await getContract();

    try {
      const tx = await contract.addEmployeeAndPayFirst(
        employeeAddress,
        ethers.parseEther(salary.toString())
      );
      await tx.wait(); // รอจนกว่า Transaction จะเสร็จสมบูรณ์
      console.log("Employee added and first salary paid");
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  }

  // ฟังก์ชันเพิ่มพนักงานและจ่ายเงินเดือนแรก
  const handleAddEmployee = async () => {
    console.log("newEmployee.address =", newEmployee.address);
    console.log("newEmployee.salary =", newEmployee.salary);

    if (
      newEmployee.address.trim() !== "" &&
      !isNaN(parseFloat(newEmployee.salary)) &&
      parseFloat(newEmployee.salary) > 0
    ) {
      const salaryInEther = parseFloat(newEmployee.salary);

      if (fundedAmount < salaryInEther) {
        alert("ยอดเงินในระบบไม่เพียงพอในการจ่ายเงินเดือน!");
        return;
      }

      // ✅ เช็กว่ามีพนักงานนี้อยู่แล้วหรือยัง
      const isDuplicate = employees.some(
        (e) => e.address.toLowerCase() === newEmployee.address.toLowerCase()
      );
      if (isDuplicate) {
        alert("พนักงานคนนี้มีอยู่แล้วในระบบ");
        return;
      }

      try {
        // ถ้าไม่ซ้ำ ค่อยเรียก smart contract
        await addEmployeeAndPayFirst(newEmployee.address, newEmployee.salary);

        setFundedAmount((prevAmount) => {
          const newAmount = prevAmount - salaryInEther;
          localStorage.setItem("fundedAmount", JSON.stringify(newAmount));
          return newAmount;
        });

        const newEmployeeData = {
          address: newEmployee.address,
          salary: salaryInEther,
          canPay: false,
          dateAdded: new Date().toISOString(),
        };
        setEmployees((prevEmployees) => {
          const updatedEmployees = [...prevEmployees, newEmployeeData];
          localStorage.setItem("employees", JSON.stringify(updatedEmployees));
          return updatedEmployees;
        });

        setNewEmployee({ address: "", salary: "" });
      } catch (error: unknown) {
        console.error("เกิดข้อผิดพลาด:", error);
        alert((error as { reason: string }).reason || "เกิดข้อผิดพลาดในการเพิ่มพนักงาน");
      }
    } else {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  const handlePaySalary = async (address: string, salary: number) => {
    const contract = await getContract();

    // เริ่มทำธุรกรรมการจ่ายเงินเดือน
    const tx = await contract.paySalary(address);
    await tx.wait();

    alert("จ่ายเงินเดือนสำเร็จ!");

    // หักยอดเงินที่เติมจาก fundedAmount
    setFundedAmount((prevAmount) => {
      const newAmount = prevAmount - salary; // หักยอดเงินที่จ่ายให้กับพนักงาน
      localStorage.setItem("fundedAmount", JSON.stringify(newAmount)); // อัปเดตค่าใน localStorage
      return newAmount;
    });

    // อัปเดตสถานะการจ่ายเงินหลังจากจ่าย
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.address === address ? { ...emp, canPay: false } : emp
      )
    );
  };

  const handleFundPayroll = async (amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ต้องการเติมให้ถูกต้อง");
      return;
    }

    try {
      const contract = await getContract();
      const tx = await contract.fundPayroll({
        value: ethers.parseEther(amount), // แปลงจำนวนเงินจาก ETH เป็น Wei
      });
      await tx.wait(); // รอการทำธุรกรรมให้เสร็จสิ้น
      alert("เติมเงินเข้าสู่ระบบสำเร็จ!");

      // อัปเดตยอดเงินที่เติมเข้า
      setFundedAmount((prevAmount) => {
        const newAmount = prevAmount + Number(amount);
        localStorage.setItem("fundedAmount", JSON.stringify(newAmount)); // เก็บยอดเงินใน localStorage
        return newAmount;
      });
    } catch (error) {
      console.error("Error funding payroll:", error);
      alert("เกิดข้อผิดพลาดในการเติมเงิน!");
    }
  };

  useEffect(() => {
    const storedFundedAmount = localStorage.getItem("fundedAmount");
    if (storedFundedAmount) {
      setFundedAmount(Number(storedFundedAmount)); // ดึงข้อมูลจาก localStorage
    }
  }, []); // โหลดข้อมูลจาก localStorage เมื่อโหลดหน้า

  const formatDateThai = (isoDateString: string) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRemoveEmployee = (address: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานนี้?")) {
      setEmployees((prevEmployees) => {
        const updatedEmployees = prevEmployees.filter(
          (emp) => emp.address !== address
        );
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
        return updatedEmployees;
      });
    }
  };

  const handleDisconnectWallet = () => {
    // เคลียร์เฉพาะ session ปัจจุบัน
    setEmployees([]);
    setFundedAmount(0);
    setWalletAddress("");

    localStorage.removeItem("connectedWallet");

    console.log("Disconnected wallet!");
  };

  const handleConnectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWalletAddress(accounts[0]);
    localStorage.setItem("connectedWallet", accounts[0]);

    // >>> ดึงข้อมูล Smart Contract ใหม่ <<<
    await fetchEmployeesFromContract();
    await fetchFundedAmountFromContract();
  };

  // ฟังก์ชันเชื่อมต่อ Contract
  const getPayrollContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      payrollSystemABI,
      signer
    );
    return contract;
  };

  // ดึงข้อมูลพนักงานทั้งหมดจาก Smart Contract
  const fetchEmployeesFromContract = async () => {
    try {
      const contract = await getPayrollContract();
      const employees = await contract.getEmployees(); // สมมติว่ามีฟังก์ชัน getEmployees() ใน Contract

      // แปลงข้อมูลนิดหน่อยถ้าจำเป็น
      const formattedEmployees = employees
        .filter((e: Employee) => e.salary !== null && e.salary !== undefined) // ตัดพนักงานที่ salary เพี้ยนทิ้งไปเลย
        .map((e: Employee) => ({
          wallet: e.wallet,
          salary: Number(ethers.formatEther(e.salary)),
          lastPaidDay: Number(e.lastPaidDay),
        }));

      setEmployees(formattedEmployees);
      console.log("Fetched employees:", formattedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // ดึงยอดเงินที่เติมเข้า Contract (fundedAmount)
  const fetchFundedAmountFromContract = async () => {
    try {
      const contract = await getPayrollContract();
      const balance = await contract.contractBalance(); // สมมติว่ามีฟังก์ชัน getContractBalance()

      const formattedBalance = Number(ethers.formatEther(balance));
      setFundedAmount(formattedBalance);
      console.log("Fetched funded amount:", formattedBalance);
    } catch (error) {
      console.error("Error fetching funded amount:", error);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header พร้อมปุ่ม Connect */}
      <header className="bg-primary text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          ระบบจ่ายเงินเดือน (Payroll System)
        </h1>

        {/* ปุ่ม Connect Wallet */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          {walletAddress ? (
            <div className="bg-white text-primary font-mono px-3 py-2 rounded-xl shadow-sm text-sm">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <Button
              variant="light"
              className="d-flex align-items-center gap-2 fw-bold"
              onClick={handleConnectWallet}
              style={{ borderRadius: "999px" }}
            >
              <FaWallet />
              Connect Wallet
            </Button>
          )}

          {walletAddress && (
            <button onClick={handleDisconnectWallet} className="btn btn-danger">
              Disconnect Wallet
            </button>
          )}
        </motion.div>
      </header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* ส่วนสำหรับเพิ่มพนักงานใหม่ */}
        <div className="card p-4 m-4 mx-auto" style={{ maxWidth: "600px" }}>
          <h2 className="card-title">เพิ่มพนักงานใหม่</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Address ของพนักงาน"
              value={newEmployee.address}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, address: e.target.value })
              }
              className="form-control mb-2"
            />
            <input
              type="number"
              placeholder="จำนวนเงินเดือน (ETH)"
              value={newEmployee.salary}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, salary: e.target.value })
              }
              className="form-control mb-2"
            />
            <Button
              className="btn btn-success w-100"
              onClick={handleAddEmployee}
            >
              เพิ่มพนักงาน
            </Button>
          </div>
        </div>

        {/* ส่วนสำหรับแสดงรายการพนักงาน */}
        <div className="card p-4 m-4 mx-auto" style={{ maxWidth: "1000px" }}>
          <h2 className="card-title">รายการพนักงาน</h2>
          <table className="table table-bordered text-sm">
            <thead className="table-light">
              <tr>
                <th className="p-2 text-left">Address</th>
                <th className="p-2 text-left">เงินเดือน</th>
                <th className="p-2 text-left">สถานะ</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-mono">{emp.address}</td>
                  <td className="p-2">{emp.salary.toLocaleString()} ETH</td>
                  <td className="p-2">{formatDateThai(emp.dateAdded)}</td>
                  <td className="p-2">
                    {emp.canPay ? "พร้อมจ่าย" : "ยังไม่ถึงรอบ"}
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      className="btn btn-primary"
                      onClick={() => handlePaySalary(emp.address, emp.salary)}
                      disabled={!emp.canPay}
                    >
                      จ่ายเงินเดือน
                    </Button>
                    <Button
                      className="btn btn-danger"
                      onClick={() => handleRemoveEmployee(emp.address)}
                    >
                      ลบ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="card p-4 m-4 text-center mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <h2 className="card-title">เติมเงินเข้าสู่ระบบ</h2>
          <div className="form-group">
            <input
              type="number"
              placeholder="จำนวนเงินที่ต้องการเติม (ETH)"
              className="form-control mb-2"
              value={newEmployee.salary}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, salary: e.target.value })
              }
            />
            <Button
              className="btn btn-primary w-100"
              onClick={() => handleFundPayroll(newEmployee.salary)} // ส่งจำนวนเงินที่กรอกให้ฟังก์ชัน
            >
              เติมเงิน
            </Button>
          </div>
        </div>

        {/* ส่วนสำหรับแสดงยอดเงินใน Smart Contract */}
        <div
          className="card p-4 m-4 text-center mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <p className="text-lg">ยอดเงินที่เติมเข้ามา:</p>
          <p className="text-2xl font-bold text-success">{fundedAmount} ETH</p>
        </div>
      </motion.div>
    </div>
  );
}
