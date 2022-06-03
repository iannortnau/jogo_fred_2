import {useEffect, useRef, useState} from "react";
import Item from "../components/Item";
import Arena from "../components/structural/Arena";

export default function Home(props) {
  const [lista, setLista] = useState([<Item nome={0} onClick={clink} key={0}/>]);
  const [update, setUpdate] = useState(1);


  function clink(){
    lista.push(<Item nome={lista.length} onClick={clink} key={lista.length}/>);
    setUpdate(lista.length);
    console.log(update);
    setLista(lista);
  }

  return (
      <Arena/>
  )
}

