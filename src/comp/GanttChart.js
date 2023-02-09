import { useRef, useEffect } from 'react';
import { useState } from 'react';
const dayjs = require('dayjs')

class GanttChartImpl {
    constructor(ctx, data, conf, popup, setPopupContent) {
        this.ctx = ctx;
        this.data = data;
        this.conf = conf;
        this.popup = popup;
        this.setPopupContent = setPopupContent;
    }
    sort() {
        this.tasks = [...this.data.tasks];
        this.tasks.sort((a, b) => { 
            let a1 = dayjs(a.startDate);
            let b1 = dayjs(b.startDate);
            if(a1.isBefore(b1)) return -1;
            if(b1.isBefore(a1)) return 1;
            return 0;
        });
    }

    computeRender(task) {
        task.y = this.context.y;
        task.x = ((dayjs(task.startDate).diff(dayjs(this.context.start), 'day')) * this.conf.width) + this.context.x;
        task.width = dayjs(task.endDate).diff(dayjs(task.startDate), 'day') * this.conf.width;
        this.context.y += this.conf.height + this.conf.ypad;
        return {width: task.x + task.width, height: this.context.y};
    }

    renderTask(task) {
        this.ctx.fillStyle = this.conf.color;
        let x = task.x;
        let y = task.y;        
        let compWidth = task.width * task.perComp / 100;
        this.ctx.fillRect(x, y, compWidth, this.conf.height);
        let pendingWidth = task.width - compWidth;
        if(pendingWidth > 0) {
            this.ctx.fillStyle = this.conf.pendingColor;
            this.ctx.fillRect(x + compWidth, y, pendingWidth, this.conf.height);
        }
        this.ctx.font = this.conf.font;
        this.ctx.fillStyle = this.conf.fillStyle;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(task.name, x + 10, y + (this.conf.height / 2), task.width);
    }    

    render() {
        let start = this.tasks[0].startDate;
        this.context = {x: this.conf.xpad, y: this.conf.height, start: start};
        let map = {};
        this.tasks.forEach(task => {
            map[task.name] = task;
        });
        let width = 0;
        let height = 0;
        let fotter = 50;
        this.tasks.forEach(task => {
            if(task.depends) {
                task.predessesor = [];
                task.depends.forEach(dep => {
                    task.predessesor.push(map[dep]);
                });
            }
            let size = this.computeRender(task)            
            if(width < size.width) width = size.width;
            if(height < size.height) height = size.height;
        });   
        this.ctx.canvas.width = width + this.conf.footerXPad;
        this.ctx.canvas.height = height + fotter;     

        this.ctx.strokeStyle = "#737373";
        this.ctx.lineWidth = 2;

        this.tasks.forEach(task => {
            this.renderTask(task);
        });

        this.renderDependencies();
        
        this.ctx.strokeRect(0, 0, width + this.conf.xpad, height);
        this.renderFooter(height + fotter/2);
    }    

    renderDependencies() {
        this.tasks.forEach(task => {
            if(task.predessesor) {
                task.predessesor.forEach(dep => {
                    let x1 = dep.x + dep.width;
                    let y1 = dep.y + this.conf.height / 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x1 + 10, y1);
                    let y2 = y1 + this.conf.height / 2 + this.conf.ypad / 2;
                    this.ctx.lineTo(x1 + 10, y2);
                    this.ctx.lineTo(x1 - 15, y2);
                    let y3 = task.y + this.conf.height / 2;
                    this.ctx.lineTo(x1 - 15, y3);
                    this.ctx.lineTo(task.x, y3);
                    this.ctx.stroke();                
                    this.ctx.beginPath();
                    this.ctx.moveTo(task.x, y3);
                    this.ctx.lineTo(task.x - 5, y3 - 3);
                    this.ctx.lineTo(task.x - 5, y3 + 3);
                    this.ctx.lineTo(task.x, y3);
                    this.ctx.fill();
                });
            }
        });
    }    

    renderFooter(y) {
        this.ctx.font = this.conf.font;
        this.ctx.fillStyle = this.conf.fillStyle;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = "middle";

        let rendered = {};

        this.tasks.forEach(task => {
            let x = ((dayjs(task.startDate).diff(dayjs(this.context.start), 'day')) * this.conf.width) + this.context.x;
            let tmpDate = dayjs(task.startDate);
            let tmpText = tmpDate.format(this.conf.dateFormat);
            if(!rendered[tmpText]) {
                this.ctx.fillText(tmpText , x, y);
                rendered[tmpText] = true;
            }            
            x = ((dayjs(task.endDate).diff(dayjs(this.context.start), 'day')) * this.conf.width) + this.context.x;
            tmpDate = dayjs(task.endDate);
            tmpText = tmpDate.format(this.conf.dateFormat)
            if(!rendered[tmpText]) {
                this.ctx.fillText(tmpText , x, y);
                rendered[tmpText] = true;
            }            
        });
    }

    draw(ctx, data, conf) { 
        this.sort();
        this.render();  
    }

    handleMouseEvent(e) {
        var rect = e.target.getBoundingClientRect();
        let ex = e.clientX - rect.left;
        let ey = e.clientY - rect.top;

        let tmptask;
        this.tasks.forEach(task => {            
            if(ex > task.x  &&  ey > task.y  
                &&  ex < (task.x + task.width)  &&  ey < (task.y + this.conf.height)) {
                    tmptask = task;
                    return false;
            }
        });

        if(tmptask) {
            this.popup.style.left = `${ex}px`;
            this.popup.style.top = `${ey}px`;
            this.setPopupContent(tmptask);
            this.popup.style.visibility = "visible";
        } else {
            this.popup.style.visibility = "hidden";
        }
    }
}



export function GanttChart({data, conf}) {
    const canvas = useRef(null);
    const popup = useRef(null);
    const [content, setContent] = useState(null);

    useEffect(() => {
        const ctx = canvas.current.getContext("2d");
        let impl = new GanttChartImpl(ctx, data, conf, popup.current, setContent);
        let listener = impl.handleMouseEvent.bind(impl);
        canvas.current.addEventListener("mousemove", listener);
        impl.draw();       
    }, [data, conf]);
    
    return (
        <div style={{position: "relative"}}>                        
            <span style={{fontSize:"13px", backgroundColor:"#ffffff", visibility: "hidden", paddingRight: "10px", paddingLeft: "10px", border: "1px solid", display:"block", position:"absolute", zIndex: "500"}} ref={popup}>                
                <GCPopupContent content={content}></GCPopupContent>
            </span> 
            <canvas ref={canvas}></canvas>  
        </div>
    )
}

export function GCPopupContent({content}) {
    if(content == null) return null;

    let assignedToArray = [];
    for(let i = 0; i < content.assignedTo.length; i++) {
        let isLast = i == (content.assignedTo.length - 1) ? true : false;
        let assignedTo = content.assignedTo[i];
        if(isLast) {
            assignedToArray.push(<span key={assignedTo}>{assignedTo}</span>);
        } else {
            assignedToArray.push(<span key={assignedTo}>{assignedTo},&nbsp;</span>);
        }        
    }
    let depArray = [];
    if(content.depends) {
        for(let i = 0; i < content.depends.length; i++) {
            let isLast = i == (content.depends.length - 1) ? true : false;
            let deptmp = content.depends[i];
            if(isLast) {
                depArray.push(<span key={deptmp}>{deptmp}</span>);
            } else {
                depArray.push(<span key={deptmp}>{deptmp},&nbsp;</span>);
            }
        }
    }    
    
    return (
        <>
            <table>
                <thead>
                    <tr><th colSpan="2">{content.name}</th></tr>
                </thead>
                <tbody>
                    <tr><td>Start Date</td><td>{dayjs(content.startDate).format("DD MMM YYYY")}</td></tr>
                    <tr><td>End Date</td><td>{dayjs(content.endDate).format("DD MMM YYYY")}</td></tr>
                    <tr><td>Assigned To</td><td>{assignedToArray}</td></tr>
                    <tr><td style={{paddingRight: "10px"}}>Percentage Completed</td><td>{content.perComp}%</td></tr>
                    {content.depends && 
                        <tr><td>Depends On</td><td>{depArray}</td></tr>
                    }
                </tbody>
            </table>
        </>
    )
}