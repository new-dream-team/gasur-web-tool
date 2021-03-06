import React from 'react';
import './App.css';

export default class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      currentChar: 0,
      name: '',
      urlImage: 'https://i.imgur.com/46fOreh.png',
      points: [],
      editMode: false
    }
    this.loadMap = this.loadMap.bind(this)
    this.clearPoints = this.clearPoints.bind(this)
    this.changeEditMode = this.changeEditMode(this)
  }

  _onMouseClick(e) {
    if(this.state.points.length < 1){
      this.state.points.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY , name: `P${this.state.currentChar}`})
    }else{
      const newPoints = this.state.points
      const diffX = Math.abs(e.nativeEvent.offsetX - newPoints[newPoints.length - 1].x)
      const diffY = Math.abs(e.nativeEvent.offsetY - newPoints[newPoints.length - 1].y)
      if(diffX > diffY){
        newPoints[newPoints.length - 1].y = e.nativeEvent.offsetY
      }else{
        newPoints[newPoints.length - 1].x = e.nativeEvent.offsetX
      }
      newPoints.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY , name: `P${this.state.currentChar}`})
      this.setState({
        points: newPoints
      })
    }
    this.setState({ currentChar: this.state.currentChar + 1})
    console.log(this.state.points[this.state.points.length - 1 ])
  }

  loadMap(event){
    event.preventDefault();
  }

  clearPoints(){
    this.setState({
      points: [],
      currentChar: 0
    })
  }

  changeEditMode(){
    this.setState({
      editMode: true
    })
  }

 render(){
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
          <input type="submit" value="Carregar"/>
          <input type="button" value="Limpar" onClick={this.clearPoints}/>
      </form>
      </div>

      <div className="App-Container">
        <div className="App-Image-Div" >
          {/* <svg className="App-Svg" onClick={this._onMouseClick.bind(this)}>
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

          </svg> */}
         <img src={this.state.urlImage} className="App-Image" alt="mapa"/>
        </div>
      </div>


    </div>
    
  );
 }
}
