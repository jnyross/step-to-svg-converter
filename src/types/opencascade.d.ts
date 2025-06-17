declare module 'opencascade.js' {
  interface OpenCascadeInstance {
    // Add basic OpenCascade types here
    BRepPrimAPI_MakeBox: any;
    TopoDS_Shape: any;
    Bnd_Box: any;
    BRepBndLib: any;
    STEPControl_Reader: any;
    IFSelect_ReturnStatus: any;
    Standard_Transient: any;
    TopExp_Explorer: any;
    TopAbs_ShapeEnum: any;
    gp_Pnt: any;
    BRepBuilderAPI_MakeEdge: any;
    BRepBuilderAPI_MakeWire: any;
    BRepBuilderAPI_MakeFace: any;
    BRepBuilderAPI_Transform: any;
    gp_Trsf: any;
    gp_Vec: any;
    BRepAlgoAPI_Section: any;
    GeomAPI_IntCS: any;
    Geom_Plane: any;
    gp_Pln: any;
    Handle_Geom_Surface: any;
    // Add more as needed
  }

  function opencascade(): Promise<OpenCascadeInstance>;
  export = opencascade;
}