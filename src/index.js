import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import {yearMonths} from './yearmonth'

const leftMargin = 200
const rightMargin = 10
const topMargin = 100
const bottomMargin = 10
const dx = 20
const dy = 30
const reversedYearMonths = Array.from(yearMonths).reverse()

class Chart extends React.Component {
  render () {
    const {top, maxRank, sort} = this.props

    const data0 = Array.from(this.props.data)
    data0.sort((d1, d2) => d2.retweetedCount - d1.retweetedCount)
    const data = data0.slice(0, Math.min(top, data0.length))
      .filter((item) => yearMonths.some((ym) => item[ym].rank != null && item[ym].rank <= maxRank))

    for (const item of data) {
      item.first = yearMonths.find((ym) => item[ym].rank != null && item[ym].rank <= maxRank)
      item.last = reversedYearMonths.find((ym) => item[ym].rank != null && item[ym].rank <= maxRank)
      item.firstIndex = yearMonths.findIndex((ym) => item[ym].rank != null && item[ym].rank <= maxRank)
      item.lastIndex = yearMonths.length - reversedYearMonths.findIndex((ym) => item[ym].rank != null && item[ym].rank <= maxRank) - 1
      item.monthCount = yearMonths.filter((ym) => item[ym].rank != null && item[ym].rank <= maxRank).length
    }

    switch (sort) {
      case 'first':
        data.sort((d1, d2) => {
          if (d1.first === d2.first) {
            return d2.retweetedCount - d1.retweetedCount
          }
          return d2.first > d1.first ? -1 : 1
        })
        break
      case 'last':
        data.sort((d1, d2) => {
          if (d1.last === d2.last) {
            return d2.retweetedCount - d1.retweetedCount
          }
          return d2.last > d1.last ? -1 : 1
        })
        break
      case 'length':
        data.sort((d1, d2) => {
          return (d2.lastIndex - d2.firstIndex) - (d1.lastIndex - d1.firstIndex)
        })
        break
      case 'retweetedCount':
        data.sort((d1, d2) => d2.retweetedCount - d1.retweetedCount)
        break
      case 'monthCount':
        data.sort((d1, d2) => {
          if (d1.monthCount === d2.monthCount) {
            return d2.first > d1.first ? -1 : 1
          }
          return d2.monthCount - d1.monthCount
        })
        break
    }

    const rScale = d3.scaleSqrt()
      .domain([0, Math.max(...data.map((item) => Math.max(...yearMonths.filter((ym) => item[ym].rank != null).map((ym) => item[ym].count))))])
      .range([0, 25])
    const lineWidthScale = d3.scaleLinear()
      .domain(d3.extent(data, (item) => item.retweetedCount))
      .range([1, 20])
    const rankColor = d3.scaleLinear()
      .domain([1, (1 + maxRank) / 2, maxRank])
      .range(['red', 'orange', 'gray'])

    const contentWidth = dx * yearMonths.length
    const contentHeight = dy * data.length
    const width = contentWidth + leftMargin + rightMargin
    const height = contentHeight + topMargin + bottomMargin

    return <svg width={width} height={height}>
      <g transform={`translate(${leftMargin},${topMargin})`}>
        <g>
          {
            yearMonths.map((ym, i) => {
              const l = 20
              const showLabel = ym.endsWith('01')
              return <g key={i} transform={`translate(${dx * i + dx / 2},0)`}>
                {showLabel ? <text dy={-l - 5} textAnchor='middle'>{ym}</text> : ''}
                <line x1='0' y1={showLabel ? -l : 0} x2='0' y2={showLabel ? contentHeight + l : contentHeight} stroke='#ccc' strokeWidth={showLabel ? 3 : 1} />
              </g>
            })
          }
        </g>
        <g>
          {
            data.map((item, i) => {
              return <g key={item.influencerId} transform={`translate(0,${i * dy + dy / 2})`}>
                <text dx='-3' dy='5' textAnchor='end'>{item.screenName}</text>
                <line x1='0' y1='0' x2={contentWidth} y2='0' stroke='#ddd' strokeWidth={lineWidthScale(item.retweetedCount)} opacity='0.5' />
              </g>
            })
          }
        </g>
        <g>
          {
            data.map((item, i) => {
              return <g key={item.influencerId} transform={`translate(0,${i * dy + dy / 2})`}>
                {
                  yearMonths.map((ym, j) => {
                    if (item[ym].rank == null || item[ym].rank > maxRank) {
                      return ''
                    }
                    return <circle key={j} cx={dx * j + dx / 2} cy='0' r={rScale(item[ym].count)} fill={rankColor(item[ym].rank)} opacity='0.7' />
                  })
                }
              </g>
            })
          }
        </g>
      </g>
    </svg>
  }
}

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      top: 100,
      maxRank: 10,
      sort: 'first'
    }
  }

  render () {
    const {data} = this.props
    const {top, maxRank, sort} = this.state

    return <div>
      <div className='container'>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div className='field'>
            <label className='label'>Top</label>
            <div className='control'>
              <input ref='top' className='input' type='number' min='1' max='100' defaultValue={top} />
            </div>
          </div>
          <div className='field'>
            <label className='label'>Rank Max</label>
            <div className='control'>
              <input ref='maxRank' className='input' type='number' min='1' max='100' defaultValue={maxRank} />
            </div>
          </div>
          <div className='field'>
            <label className='label'>Sort</label>
            <div className='control'>
              <select ref='sort' className='input' defaultValue={sort}>
                <option value='first'>first</option>
                <option value='last'>last</option>
                <option value='length'>last - first</option>
                <option value='retweetedCount'>retweeted count</option>
                <option value='monthCount'>month count</option>
              </select>
            </div>
          </div>
          <div className='field'>
            <div className='control'>
              <button className='button' type='submit'>Update</button>
            </div>
          </div>
        </form>
      </div>
      <div style={{overflow: 'scroll'}} >
        <Chart data={data} top={top} maxRank={maxRank} sort={sort} />
      </div>
    </div>
  }

  handleSubmit (event) {
    event.preventDefault()
    this.setState({
      top: +this.refs.top.value,
      maxRank: +this.refs.maxRank.value,
      sort: this.refs.sort.value
    })
  }
}

window.fetch('data.json')
  .then((response) => response.json())
  .then((data) => {
    for (const item of data) {
      item.influencerId = item.influencer_id
      item.screenName = item.screen_name
      item.count = +item.count
      item.retweetedCount = +item.retweeted_count
      item.months = +item.months
      for (const ym of yearMonths) {
        if (item[ym].rank) {
          item[ym].rank = +item[ym].rank
          item[ym].count = +item[ym].count
        } else {
          item[ym].rank = null
          item[ym].count = null
        }
      }
    }
    ReactDOM.render(<App data={data} />, document.querySelector('#content'))
  })
