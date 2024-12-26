var config = {
  background: "#c3d657",
  resources: [
    {
      type: "concrete",
      color: "#777",
      initial_amount: 50,
    },
    {
      type: "metal",
      color: "#ccc",
      initial_amount: 50,
    },
    {
      type: "energy",
      color: "#7ff",
      initial_amount: 0,
    },
  ],
  buildings: [
    {
      type: "depot",
      title: "Depot: store resources",
      hp: 1000,
      width: 2,
      height: 2,
      building_cost: {
        concrete: 10,
      },
    },
    {
      type: "generator",
      title: "Generator: generates energy",
      hp: 200,
      width: 1,
      height: 1,
      building_cost: {
        concrete: 5,
        metal: 5,
      },
      profit: {
        energy: 5,
      }
    },
  ],
};