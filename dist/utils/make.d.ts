declare class Make {
    #private;
    formatData(dataUsr?: Date): string;
    tagInfDPS(obj: any): void;
    tagSubst(obj: any): void;
    tagPrest(obj: any): void;
    tagPrestEnd(obj: any): void;
    tagPrestRegTrib(obj: any): void;
    tagToma(obj: any): void;
    tagTomaEnd(obj: any): void;
    tagInterm(obj: any): void;
    tagIntermEnd(obj: any): void;
    tagServ(obj: any): void;
    tagServComExt(obj: any): void;
    tagServLsadppu(obj: any): void;
    tagServObra(obj: any): void;
    tagServAtvEvento(obj: any): void;
    tagServExplRod(obj: any): void;
    tagServInfoCompl(obj: any): void;
    tagVServPrest(obj: any): void;
    tagVDescCondIncond(obj: any): void;
    tagVDedRed(obj: any): void;
    tagVDedRedDoc(obj: any): void;
    tagVDedRedDocNFSeMun(obj: any): void;
    tagTribMun(obj: any): void;
    tagTotTribPTotTrib(obj: any): void;
    xml(): any;
}
export { Make };
declare const _default: {
    Make: typeof Make;
};
export default _default;
