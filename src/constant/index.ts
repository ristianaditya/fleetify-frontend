import {
  LayoutDashboard,
  Hotel,
  IdCardLanyard,
  ListChecks,
  LaptopMinimalCheck
} from "lucide-react"

export const listMenu = [
  {
    titleName: "Dashbaord",
    title: false,
    menuList: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard
      }
    ]
  },
  {
    titleName: 'Masters',
    title: true,
    menuList: [
      {
        title: "Department",
        url: "/department",
        icon: Hotel,
      },
      {
        title: "Employee",
        url: "/employee",
        icon: IdCardLanyard,
      }
    ]
  },
  {
    titleName: 'Attendance',
    title: true,
    menuList: [
      {
        title: "Attendance",
        url: "/check",
        icon: LaptopMinimalCheck,
      },
      {
        title: "Attendance History",
        url: "/attendance",
        icon: ListChecks,
      }
    ]
  }
]