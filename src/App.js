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

    this._onMouseClick = this._onMouseClick.bind(this)
    this.clearPoints = this.clearPoints.bind(this)
    this.generateJson = this.generateJson.bind(this)
    this.formatAdditionalRoutes = this.formatAdditionalRoutes.bind(this)
    this.debug = this.debug.bind(this)
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
      let newAdditionalPoints = this.state.additionalPoints;
      if(cursorPoint){
          newAdditionalPoints.push({ x: Math.round(cursorPoint.x), y: Math.round(cursorPoint.y), name: cursorPoint.name, wasAPoint: true, isInJson: cursorPoint.isInJson})

          if(newAdditionalPoints.length % 2 === 0 ){
            // verifica o que tem atras e muda
            if(!newAdditionalPoints[newAdditionalPoints.length - 2].wasAPoint){
              this.changePointPosition(newAdditionalPoints, (newAdditionalPoints.length - 2), (newAdditionalPoints.length-1))
            }
          }
      }else{
          // newAdditionalPoints = this.addNewAdjustedPoint(this.state.additionalPoints,e)
          newAdditionalPoints.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY , name: `P${this.state.currentChar}`, wasAPoint: false, isInJson: false})
          this.setState({ currentChar: this.state.currentChar + 1})
          if(newAdditionalPoints.length % 2 === 0 ){
            if(newAdditionalPoints[newAdditionalPoints.length - 2].wasAPoint){
              this.changePointPosition(newAdditionalPoints, (newAdditionalPoints.length - 1), (newAdditionalPoints.length-2))
            }else {
              this.changePointPosition(newAdditionalPoints, (newAdditionalPoints.length - 2), (newAdditionalPoints.length-1))
            }
            newAdditionalPoints[newAdditionalPoints.length-1].wasAPoint = true;
          }
      }

      this.setState({
        additionalPoints: newAdditionalPoints
      })
    }
  }

  changePointPosition(points, indexToChange, indexToCompare){
    const diffX = Math.abs(points[indexToChange].x  - points[indexToCompare].x);
    const diffY = Math.abs(points[indexToChange].y  - points[indexToCompare].y);
    if(diffX > diffY){
      points[indexToChange].y = points[indexToCompare].y
    } else {
      points[indexToChange].x = points[indexToCompare].x
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
    
    let aux = this.state.json.find( point => {
      const xDiff = Math.abs( x - point.x);
      const yDiff = Math.abs( y - point.y);
      const diffRange = 10
      return xDiff <= diffRange && yDiff <= diffRange
    });

    if(aux){
      aux.x /= this.state.scale;
      aux.y /= this.state.scale;
      aux.isInJson = true;
      return aux;
    }

    aux = this.state.additionalPoints.find( point => {
      const xDiff = Math.abs( e.nativeEvent.offsetX - point.x);
      const yDiff = Math.abs( e.nativeEvent.offsetY - point.y);
      const diffRange = 10
      return xDiff <= diffRange && yDiff <= diffRange
    });

    if(aux){
      aux.isInJson = false;
    }

    return aux;
  }

  clearPoints() {
    this.setState({
      points: [],
      currentChar: 0,
      editMode: 0
    });
  }

  generateJson() {
    const scale = document.getElementById("mapa").naturalHeight / document.getElementById("mapa").height;

    this.setState({
      scale,
      points: this.state.points.map((point, index, elements) => {       
        if (index < 1) {
          const nextPoint = elements[index + 1];
          point.distances = [
            {
              pointName: nextPoint.name,
              pointDistance: this.calculateDistance(point, nextPoint)
            }
          ];
        } else if (index < elements.length -1 ){
          const prevPoint = elements[index - 1];
          const nextPoint = elements[index + 1];
          point.distances = [
            {
              pointName: nextPoint.name,
              pointDistance: this.calculateDistance(point, nextPoint)
            },
            {
              pointName: prevPoint.name,
              pointDistance: this.calculateDistance(prevPoint, point)
            }
          ];
        } else {
          const prevPoint = elements[index - 1];
          point.distances = [
            {
              pointName: prevPoint.name,
              pointDistance: this.calculateDistance(prevPoint, point)
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

  calculateDistance(pointA, pointB){
    return Math.round(Math.sqrt(Math.pow((pointB.x - pointA.x),2) + Math.pow((pointB.y - pointA.y),2)));
  }
  
  distanceToLine(lineStart, lineEnd, point){
    const c = this.calculateDistance(lineStart, lineEnd);
    const a = this.calculateDistance(lineStart, point);
    const b = this.calculateDistance(lineEnd, point);
    if (b^2 > a^2 + c^2)
      return a;
    else if (a^2 > b^2 + c^2)
      return b;
    else {
      let s = (a+b+c)/2
      return 2/c * Math.sqrt(s*(s-a)*(s-b)*(s-c))
    }     
  }

  forcePointCoordinatesToLine(lineStart, lineEnd, point){    
    const startToPoint = [point.x - lineStart.x, point.y - lineStart.y];
    const startToEnd = [lineEnd.x - lineStart.x, lineEnd.y - lineStart.y];

    const startToEndMagnitudeSquared = Math.pow(startToEnd[0],2) + Math.pow(startToEnd[1],2);

    const startToEndDotProduct = startToPoint[0] * startToEnd[0] + startToPoint[1] * startToEnd[1];

    const normalizedDistanceLineStartToPoint = startToEndDotProduct / startToEndMagnitudeSquared;

    return {
      x: lineStart.x + startToEnd[0] * normalizedDistanceLineStartToPoint,
      y: lineStart.y + startToEnd[1] * normalizedDistanceLineStartToPoint,
    };
  }

  debug(){
    console.log("JSON");
    this.print(this.state.json);
    console.log("addtnlpts");
    this.print(this.state.additionalPoints);
  }

  formatAdditionalRoutes(){
   
    const additionalPoints = this.state.additionalPoints
    
    for( var i = 0; i < additionalPoints.length; i+=2 ){
      let currentPoint = additionalPoints[i];
      currentPoint.x *= this.state.scale;
      currentPoint.y *= this.state.scale;

      let nextPoint = additionalPoints[i+1];
      nextPoint.x *= this.state.scale;
      nextPoint.y *= this.state.scale;
      const jsonPoints = this.state.json;
     
      if(!currentPoint.isInJson){
        loop1:
        for ( let i=0; i < jsonPoints.length; i++){
          const point = jsonPoints[i];

          loop2:
          for ( let j=0; j < point.distances.length; j++){
            const distance = point.distances[j];
            const connectedPoint = jsonPoints.find(p => distance.pointName === p.name);
            if (this.distanceToLine(point, connectedPoint, currentPoint) <= 10) {
              currentPoint = this.forcePointCoordinatesToLine(point, connectedPoint, currentPoint);
              
              point.distances.splice(point.distances.map(d => d.pointName).indexOf(connectedPoint.name), 1);
              connectedPoint.distances.splice(connectedPoint.distances.map(d => d.pointName).indexOf(point.name), 1);

              jsonPoints.push({
                name: currentPoint.name,
                x: currentPoint.x,
                y: currentPoint.y,
                distances: [
                  {
                    pointName: point.name,
                    pointDistance: this.calculateDistance(currentPoint, point)
                  },
                  {
                    pointName: connectedPoint.name,
                    pointDistance: this.calculateDistance(currentPoint, connectedPoint)
                  }
                ]
              });

              point.distances.push({
                pointName: currentPoint.name,
                pointDistance: this.calculateDistance(point, currentPoint)
              });

              connectedPoint.distances.push({
                pointName: connectedPoint.name,
                pointDistance: this.calculateDistance(point, connectedPoint)
              });

              break loop1;
            }
          }
        }



      }

      if(!nextPoint.isInJson) {
        this.state.json.forEach(point => {
          point.distances.forEach( distance => {
            const connectedPoint = this.state.json.find(p => distance.pointName === p.name);
            if (this.distanceToLine(point, connectedPoint, nextPoint) <= 10) {
              //está na linha, ajusta essa desgraça
              //sai do forEach break continue sua mae
            }
          })
        })

      }

      if(currentPoint.isInJson){
        const point = this.state.json.find( point => (currentPoint.name === point.name));
        point.distances.push({
          pointName: nextPoint.name, 
          pointDistance: this.calculateDistance(point, nextPoint)
        })
      }
    }
  }

  print( json ){
    console.log(JSON.stringify(json))
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
            <input type="button" value="Salvar rotas" onClick={this.formatAdditionalRoutes}/>
            <input type="button" value="Debug" onClick={this.debug}/>

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
                      <line className="App-Svg-Rect" x1={`${lastPoint.x}`} y1={`${lastPoint.y}`} x2={`${point.x}`} y2={`${point.y}`} key={key*29} style={{"stroke":"rgb(0,255,0)", "strokeWidth":2 }}/>
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
