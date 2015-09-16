/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React from 'react';

import {Popover, OverlayTrigger} from 'react-bootstrap';
import connectionActions from '../actions/connectionActions.js';
import layoutStrategies from '../common/layoutStrategies.js';

var ConnectionSetup = React.createClass({
    _disconnect: function() {
        connectionActions.disconnectFromDevice(this.props.device.peer_addr.address);
        this.props.closePopover();
    },
    render: function() {
        var connection = this.props.device.connection;
        return (
            <div>
                <form className="form-horizontal">
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="interval">Connection Interval</label>
                        <div className="col-sm-4">
                            <input disabled className="form-control" type="number" id="interval" value = {connection.conn_params.max_conn_interval}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="latency">Latency</label>
                        <div className="col-sm-4">
                            <input disabled  className="form-control" type="number" id="latency" value={connection.conn_params.slave_latency}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="timeout">Timeout</label>
                        <div className="col-sm-4">
                            <input disabled  className="form-control" type="number" id="timeout" value={connection.conn_params.conn_sup_timeout}/>
                        </div>
                    </div>
                </form>
                <hr/>
                <button onClick = {this._disconnect}>Disconnect</button>
            </div>
        );
    }
});

var ConnectionOverlay = React.createClass({
    closeme: function() {
        this.refs.overlayTrigger.hide();
    },
    render: function() {
        var overlayRef = this.refs.overlayTrigger;
        return (
            <div className="connection-info-button" style={this.props.style}>
                <OverlayTrigger ref="overlayTrigger" trigger={['click', 'focus']}  rootClose={true} placement='left' overlay={<Popover title='Connection Setup'><ConnectionSetup device ={this.props.device} closePopover = {this.closeme}/></Popover>}>
                    <span style={{fontSize: '15px'}}>
                        <i className="icon-link icon-encircled"></i>
                    </span>
                </OverlayTrigger>
            </div>
            );
    }
});

var Connector = React.createClass({
    _generateLines: function(lineCoordinates) {
        var result = [];
        for(var i=0; i<lineCoordinates.length-1; i++) {
            result.push(<line stroke="black" strokeWidth="3" strokeLinecap="square" key={i}
                         x1={lineCoordinates[i].x} y1={lineCoordinates[i].y} x2={lineCoordinates[i+1].x} y2={lineCoordinates[i+1].y}/>);
        }
        return result;
    },
    _getConnectionOverlay: function(lineCoordinates) {
        if (lineCoordinates.length < 2) {
            return;
        }

        var pointA = lineCoordinates[lineCoordinates.length - 2];
        var pointB = lineCoordinates[lineCoordinates.length - 1];

        var posX = (pointA.x - pointB.x) / 2;
        var posY = (pointA.y - pointB.y) / 2;

        var targetElement = document.getElementById(this.props.targetId);
        var targetRect = targetElement.getBoundingClientRect();

        if (posX == 0) {
            posX = targetRect.width / 2;
        }

        if (posY == 0) {
            posY = targetRect.height / 2;
        }

        return (<ConnectionOverlay style={{position: 'absolute', left: posX - 12, top: posY - 12}} device={this.props.device}/>);
    },
    render: function() {
        var sourceElement = document.getElementById(this.props.sourceId);
        var targetElement = document.getElementById(this.props.targetId);

        if(!sourceElement || !targetElement) {
            return (<div/>);
        }
        var sourceRect = sourceElement.getBoundingClientRect();
        var targetRect = targetElement.getBoundingClientRect();

        var layoutInfo = layoutStrategies[this.props.layout](sourceRect, targetRect, 3);
        var connectorBox = layoutInfo.boundingBox;
        var lines = this._generateLines(layoutInfo.lineCoordinates);
        var connectionInfoOverlay = this._getConnectionOverlay(layoutInfo.lineCoordinates);

        return (<div>
                    <svg style={{position: 'absolute', left: connectorBox.left, top: connectorBox.top, width: connectorBox.width, height: connectorBox.height}}>
                        {lines}
                    </svg>
                    {connectionInfoOverlay}
                </div>);
    }
});

module.exports = Connector;
