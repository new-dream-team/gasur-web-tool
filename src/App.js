import React from 'react';
import './App.css';

import api from './services/api'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentChar: 0,
      name: '',
      urlImage: 'https://i.imgur.com/46fOreh.png',
      points: [],
      additionalPoints: [],
      editMode: 0,
      scale: 1,
      json: [],
    }
    this.clearPoints = this.clearPoints.bind(this)
    this.generateJson = this.generateJson.bind(this)
    this._onMouseClick = this._onMouseClick.bind(this)
  }

  _onMouseClick(e) {
    if(this.state.editMode === 0){
      if (this.state.points.length < 1) {
        this.state.points.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY , name: `P${this.state.currentChar}`})
      } else {
        const newPoints = this.addNewAdjustedPoint(this.state.points,e)
        this.setState({
          points: newPoints
        })
      }
      this.setState({ currentChar: this.state.currentChar + 1})
    } else if ( this.state.editMode === 1){
      const cursorPoint = this.cursorPoint(e)
      console.log(JSON.stringify(cursorPoint))
      let newAdditionalPoints = this.state.additionalPoints;
      if(cursorPoint){
          newAdditionalPoints.push({ x: Math.round(cursorPoint.x), y: Math.round(cursorPoint.y), name: cursorPoint.name, wasAPoint: true})
          if(newAdditionalPoints.length % 2 === 0 ){
            // verifica o que tem atras e muda
            if(!newAdditionalPoints[newAdditionalPoints.length - 2].wasAPoint){
              //pode alterar
              const diffX = Math.abs(newAdditionalPoints[newAdditionalPoints.length-1].x  - newAdditionalPoints[newAdditionalPoints.length-2].x)
              const diffY = Math.abs(newAdditionalPoints[newAdditionalPoints.length-1].y  - newAdditionalPoints[newAdditionalPoints.length-2].y)
              if(diffX > diffY){
                newAdditionalPoints[newAdditionalPoints.length - 2].y = newAdditionalPoints[newAdditionalPoints.length-1].y
              } else {
                newAdditionalPoints[newAdditionalPoints.length - 2].x = newAdditionalPoints[newAdditionalPoints.length-1].x
              }
            }
          }
      }else{
          // newAdditionalPoints = this.addNewAdjustedPoint(this.state.additionalPoints,e)
          newAdditionalPoints.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY , name: `P${this.state.currentChar}`, wasAPoint: false})
          this.setState({ currentChar: this.state.currentChar + 1})
          if(newAdditionalPoints.length % 2 === 0 ){
            if(newAdditionalPoints[newAdditionalPoints.length - 2].wasAPoint){
              console.log('cai onde deveria')
              const diffX = Math.abs(newAdditionalPoints[newAdditionalPoints.length-1].x  - newAdditionalPoints[newAdditionalPoints.length-2].x)
              const diffY = Math.abs(newAdditionalPoints[newAdditionalPoints.length-1].y  - newAdditionalPoints[newAdditionalPoints.length-2].y)
              if(diffX > diffY){
                newAdditionalPoints[newAdditionalPoints.length - 1].y = newAdditionalPoints[newAdditionalPoints.length-2].y
              } else {
                newAdditionalPoints[newAdditionalPoints.length - 1].x = newAdditionalPoints[newAdditionalPoints.length-2].x
              }
            }else {
              const diffX = Math.abs(newAdditionalPoints[newAdditionalPoints.length-1].x  - newAdditionalPoints[newAdditionalPoints.length-2].x)
              const diffY = Math.abs(newAdditionalPoints[newAdditionalPoints.length-1].y  - newAdditionalPoints[newAdditionalPoints.length-2].y)
              if(diffX > diffY){
                newAdditionalPoints[newAdditionalPoints.length - 2].y = newAdditionalPoints[newAdditionalPoints.length-1].y
              } else {
                newAdditionalPoints[newAdditionalPoints.length - 2].x = newAdditionalPoints[newAdditionalPoints.length-1].x
              }
            }
            newAdditionalPoints[newAdditionalPoints.length-1].wasAPoint = true;
          }
      }

      this.setState({
        additionalPoints: newAdditionalPoints
      })
    }
  }

  addNewAdjustedPoint(points, e){
    const newPoints = points
    const diffX = Math.abs(e.nativeEvent.offsetX - newPoints[newPoints.length - 1].x)
    const diffY = Math.abs(e.nativeEvent.offsetY - newPoints[newPoints.length - 1].y)
    if(diffX > diffY){
      newPoints[newPoints.length - 1].y = e.nativeEvent.offsetY
    } else {
      newPoints[newPoints.length - 1].x = e.nativeEvent.offsetX
    }
    newPoints.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY , name: `P${this.state.currentChar}`})
    return newPoints;
  }

  cursorPoint(e){
    const x = Math.round(e.nativeEvent.offsetX * this.state.scale);
    const y = Math.round(e.nativeEvent.offsetY * this.state.scale);
    
    const aux = this.state.json.find( point => {
      const xDiff = Math.abs( x - point.x);
      const yDiff = Math.abs( y - point.y);
      const diffRange = 10
      return xDiff <= diffRange && yDiff <= diffRange
    });

    if(aux){
      aux.x /= this.state.scale;
      aux.y /= this.state.scale;
      return aux;
    }

    return this.state.additionalPoints.find( point => {
      const xDiff = Math.abs( e.nativeEvent.offsetX - point.x);
      const yDiff = Math.abs( e.nativeEvent.offsetY - point.y);
      const diffRange = 10
      return xDiff <= diffRange && yDiff <= diffRange
    });
  }

  clearPoints() {
    this.setState({
      points: [],
      currentChar: 0,
      editMode: 0
    });
  }

  async generateJson() {
    const scale = document.getElementById("mapa").naturalHeight / document.getElementById("mapa").height;

    this.setState({
      scale,
      points: this.state.points.map((point, index, elements) => {       
        if (index < 1) {
          const nextPoint = elements[index + 1];
          point.distances = [
            {
              pointName: nextPoint.name,
              pointDistance: Math.round(Math.sqrt(Math.pow((nextPoint.x - point.x),2) + Math.pow((nextPoint.y - point.y),2)))
            }
          ];
        } else if (index < elements.length -1 ){
          const prevPoint = elements[index - 1];
          const nextPoint = elements[index + 1];
          point.distances = [
            {
              pointName: nextPoint.name,
              pointDistance: Math.round(Math.sqrt(Math.pow((nextPoint.x - point.x),2) + Math.pow((nextPoint.y - point.y),2)))
            },
            {
              pointName: prevPoint.name,
              pointDistance: Math.round(Math.sqrt(Math.pow((point.x - prevPoint.x),2) + Math.pow((point.y - prevPoint.y),2)))
            }
          ];
        } else {
          const prevPoint = elements[index - 1];
          point.distances = [
            {
              pointName: prevPoint.name,
              pointDistance: Math.round(Math.sqrt(Math.pow((point.x - prevPoint.x),2) + Math.pow((point.y - prevPoint.y),2)))
            }
          ];
        }
        return point;
        
    })});

    const json = this.state.points.map((point) => {
      const newPoint= {}
      newPoint.name = point.name
      newPoint.x = Math.round(point.x * scale);
      newPoint.y = Math.round(point.y * scale);
      newPoint.distances = point.distances.map(distance => {
        const newDistance = {};
        newDistance.pointName = distance.pointName;
        newDistance.pointDistance = Math.round(distance.pointDistance * scale);
        return newDistance;
      });
      return newPoint;
    });

    this.setState({
      json
    });

    this.changeEditMode(1)
  }

  changeEditMode(editMode){
    this.setState({
      editMode,
    })
  }

 render() {
  return (
    <div className="App">
      <div className="App-Header">
        <form onSubmit={this.loadMap} className="App-Form">
            <label htmlFor="name">
              Nome
              <input type="text" onChange={(event) => this.setState({name: event.target.value})} name="name" className="App-Input"/>
            </label>
            <label htmlFor="urlImage">
              URL da Imagem
              <input type="text" onChange={(event) => this.setState({urlImage: event.target.value})} name="urlImage" className="App-Input" />
            </label>
            <input type="button" value="Limpar" onClick={this.clearPoints}/>
            <input type="button" value="Editar rotas" onClick={this.generateJson}/>
        </form>
      </div>

      <div className="App-Container">
        <div className="App-Image-Div" >
          <svg className="App-Svg" onClick={this._onMouseClick} >
              {this.state.points.map((point,key) => {
                if(key === 0){
                  return(
                    <rect className="App-Svg-Rect" x={`${point.x- 5}`} y={`${point.y-5}`} key={key} rx="20" ry="20" width="10" height="10" fill="yellow"/>
                  );
                }else{
                  const lastPoint = this.state.points[key - 1];
                  return(
                    <>
                      <rect className="App-Svg-Rect" x={`${point.x- 5}`} y={`${point.y-5}`} key={key} rx="20" ry="20" width="10" height="10" fill="yellow"/>
                      <line className="App-Svg-Rect" x1={`${lastPoint.x}`} y1={`${lastPoint.y}`} x2={`${point.x}`} y2={`${point.y}`} key={key*1000} style={{"stroke":"rgb(255,0,0)", "strokeWidth":2 }}/>
                    </>
                  );
                }
              })}
              {
              this.state.additionalPoints.map((point, key, points) => {
                if(key > 0 && key%2 !== 0){
                  const lastPoint = points[key - 1];
                  return(
                    <>
                      <rect className="App-Svg-Rect" x={`${lastPoint.x- 5}`} y={`${lastPoint.y-5}`} key={key*27} rx="20" ry="20" width="10" height="10" fill="yellow"/>
                      <line className="App-Svg-Rect" x1={`${lastPoint.x}`} y1={`${lastPoint.y}`} x2={`${point.x}`} y2={`${point.y}`} key={key*29} style={{"stroke":"rgb(255,0,0)", "strokeWidth":2 }}/>
                      <rect className="App-Svg-Rect" x={`${point.x- 5}`} y={`${point.y-5}`} key={key*31} rx="20" ry="20" width="10" height="10" fill="yellow"/>
                    </>
                  )
                }
              })}
          </svg>
         <img id="mapa" src={this.state.urlImage} className="App-Image" alt="mapa"/>
        </div>
      </div>


    </div>
    
  );
 }
}
