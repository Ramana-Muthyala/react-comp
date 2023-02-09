let data = {
    tasks: [
        {
            name: "POC",
            startDate: Date.parse("05 Mar 2022"),
            endDate: Date.parse("10 Mar 2022"),
            assignedTo: ["Rahul"],
            perComp: 50,
            depends: ["Requrements"]
        }, {
            name: "Requrements",
            startDate: Date.parse("01 Mar 2022"),
            endDate: Date.parse("05 Mar 2022"),
            assignedTo: ["Ramana", "Rahul"],
            perComp: 80
        }, {
            name: "Design",
            startDate: Date.parse("05 Mar 2022"),
            endDate: Date.parse("10 Mar 2022"),
            assignedTo: ["Ramana"],
            perComp: 50,
            depends: ["Requrements"]
        }, {
            name: "DevIteration1",
            startDate: Date.parse("10 Mar 2022"),
            endDate: Date.parse("20 Mar 2022"),
            assignedTo: ["Ramana"],
            perComp: 20,
            depends: ["Design"]
        }, {
            name: "DevIteration2",
            startDate: Date.parse("15 Mar 2022"),
            endDate: Date.parse("20 Mar 2022"),
            assignedTo: ["Ramana"],
            perComp: 20,
            depends: ["Requrements", "Design"]
        }
    ]
};
let conf = {
    width: 30,
    height: 30,
    xpad: 20,
    ypad: 20,
    color: "#85a3e0",
    pendingColor: "#d0d0e1",
    font: "15px Serif",
    fillStyle: "black",
    footerXPad: 50,
    dateFormat: "DD MMM"
};

export {data, conf};