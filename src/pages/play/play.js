import "./play.css"

import { useEffect, useState, useRef } from "react";
import debounce from "debounce";
import { getDimensions } from "../../components/map/grid/gridManager";
import PlayHeader from "../../components/header/playheader";
import MapCanvas from "../../components/map/map";
import CardCell from "../../components/cellCard/card"
import Cursor from "../../components/cursor/exploreCursor";
import Register from "./menus/register";
import Select from "./menus/select";
import { Spinner } from '../../components/spinner'

import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'

function Play() {

  const dimensions = getDimensions({ x: 0, y: 0 }, 48);
  const [key, setKey] = useState(0);
  const { library, account } = useWeb3React();
  if (library === undefined)
    window.location.href = "/";
  const [contract, setContract] = useState(undefined);
  const [gameState, setGameState] = useState(0);
  const [colonies, setColonies] = useState([]);

  useEffect(() => {
    const { abi } = require("../../contracts/Eykar.json");
    const loadedContract = new Contract("0x46C65e6C9662E176629c496bC4716a925182Ea06", abi, library
      .getSigner(account));
    setContract(loadedContract);
    (async () => { setColonies(await loadedContract.getColonies(account)); })();
    const onBlock = () =>
      (async () => { setColonies(await loadedContract.getColonies(account)); })();

    library.on('block', onBlock);
    return () => { library.removeListener('block', onBlock); };
  }, [library, account]);

  useEffect(() => {
    if (colonies.length === 0)
      setGameState(1);
    else
      setGameState(1);
  }, [colonies]);

  useEffect(() => {
    const handler = debounce(() => setKey((oldValue) => oldValue + 1), 20);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler)
  });

  const voronoi = {
    data: null,
    get getVoronoi() {
      return this.data;
    },
    /**
     * @param {Delaunay} newValue
     */
    set setVoronoi(newValue) {
      this.data = newValue;
    }
  }

  const [cell, setCell] = useState(0);
  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [coordinatesPerId, setCoordinatesPerId] = useState(new Map());
  const [biome, setBiome] = useState([0, 0, ""]);

  const [topLeft, setTopLeft] = useState(dimensions.topLeft);
  const [bottomRight, setBottomRight] = useState(dimensions.bottomRight);

  const [xPrefix, setXPrefix] = useState(0);
  const [yPrefix, setYPrefix] = useState(0);
  const xStep = useRef(1);
  const yStep = useRef(1);

  let component;
  switch (gameState) {
    case 0:
      component = <div className="game overlay fadeIn" >
        <h1 className="game title" >Loading...</h1>
        <Spinner color={'white'} className="game loading" />
      </div>;
      break;

    case 1:
      component = <Register setGameState={setGameState} contract={contract} />;
      break;

    case 2:
      component = <Select setGameState={setGameState}
        setTopLeft={setTopLeft} setBottomRight={setBottomRight}
        contract={contract} colonies={colonies} />
      break;

    case 3:
      component = (<><CardCell cellNumber={cell} coord={coord} coordinatesPerId={coordinatesPerId} biome={biome} />
        <Cursor xStep={xStep} yStep={yStep} xPrefix={xPrefix} setXPrefix={setXPrefix} yPrefix={yPrefix} setYPrefix={setYPrefix} setCoord={setCoord} setCell={setCell} coordinatesPerId={coordinatesPerId} voronoi={voronoi} setTopLeft={setTopLeft} topLeft={topLeft}
          setBiome={setBiome} bottomRight={bottomRight} setBottomRight={setBottomRight} /></>);
      break;
  }


  return (
    <div className="game screen">
      <PlayHeader gameState={gameState} setGameState={setGameState} />
      <MapCanvas key={key} xStep={xStep} yStep={yStep} xPrefix={xPrefix} yPrefix={yPrefix}
        topLeft={topLeft} setTopLeft={setTopLeft} bottomRight={bottomRight}
        setBottomRight={setBottomRight}
        coordinatesPerId={coordinatesPerId} voronoi={voronoi} />
      {component}
    </div>
  );

}
export default Play;