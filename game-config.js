var config = {
  background: "#c3d657",
  map: {
    cols: 100,
    rows: 100,
    resource_mines: [
      {
        type: "concrete",
        numbers: 20,
      },
      {
        type: "metal",
        numbers: 10,
      },
    ], 
  },
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
      type: "base",
      title: "Base: store resources",
      hp: 2000,
      width: 2,
      height: 2,
      building_cost: {
        concrete: 400,
        metal: 200,
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
        energy: 1,
      },
      storage: 20,
    },
    {
      type: "concrete_factory",
      title: "Concrete Factory",
      hp: 200,
      width: 1,
      height: 1,
      placement_restriction: "concrete",
      building_cost: {
        concrete: 5,
        metal: 5,
      },
      profit: {
        concrete: 1,
      },
      storage: 20,
    },
    {
      type: "metal_mill",
      title: "Metal Mill",
      hp: 200,
      width: 1,
      height: 1,
      placement_restriction: "metal",
      building_cost: {
        concrete: 5,
        metal: 5,
      },
      profit: {
        metal: 1,
      },
      storage: 20,
    },
  ],
};