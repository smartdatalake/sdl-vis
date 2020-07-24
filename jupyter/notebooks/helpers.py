import io
from IPython.display import display, HTML
import numpy as np
import matplotlib.pyplot as plt

textSize = 6

plt.rc('font', size=textSize)          # controls default text sizes
plt.rc('axes', titlesize=textSize)     # fontsize of the axes title
plt.rc('axes', labelsize=10)    # fontsize of the x and y labels
plt.rc('xtick', labelsize=textSize)    # fontsize of the tick labels
plt.rc('ytick', labelsize=textSize)    # fontsize of the tick labels
plt.rc('legend', fontsize=textSize)    # legend fontsize
plt.rc('figure', titlesize=textSize)  # fontsize of the figure title

def rowentry(table,col,con):

    col['prop'] = {}
    col['prop']['nUnique'],col['prop']['len'] = con.execute(f'''SELECT count(DISTINCT {col["name"]}), COUNT(*) from {table}''').fetchone()
    col['prop']['null'] = con.execute(f'''SELECT count(*) from {table} where {col["name"]} is NULL''').fetchone()[0]

    numeric = ['integer', 'smallint', 'int64', 'float', 'float64', 'numeric', 'double precision']
    date = ['timestamp without time zone']
    
    if col['dtype'] in numeric:
        if col['prop']['nUnique'] <= 5:
            col['plot'] = 'pie'
        else:
            col['plot'] = 'hist'
        
        col['prop']['mean'],col['prop']['min'],col['prop']['max'] = con.execute(f'''
        SELECT AVG({col["name"]}), 
        MIN({col["name"]}), 
        MAX({col["name"]}) as max
        from {table};''').fetchone()
        try:
            round(col['prop']['mean'],2)
        except:
            print("null value")
    
    elif col['dtype'] in date:
        col['plot'] = 'histdate'
        
        col['prop']['mean'],col['prop']['min'],col['prop']['max'] = con.execute(f'''
        SELECT to_timestamp(AVG(extract(epoch from {col["name"]})))::timestamp, 
        to_timestamp(MIN(extract(epoch from {col["name"]})))::timestamp, 
        to_timestamp(MAX(extract(epoch from {col["name"]})))::timestamp
        from {table};''').fetchone()

    else:
        if col['prop']['nUnique'] <= 5:
            col['plot'] = 'pie'
        else:
            col['plot'] = 'list'
          
    if col['prop']['nUnique'] == 1:
        col['plot'] = 'oneval'
    #print(col)
    
    
    left = f"""
        <span style='
        display:flex;
        flex-direction:column;
        border-right:1px solid black;
        justify-content:center;
        padding:5px;
        width:20%'> 
            <div style='font-weight: bold'>
                {col['name']}
            </div> 
            <div>
                {col['dtype']} 
            </div>
        </span>"""
    
    right = f"""
        <span style='
        display:flex;
        flex-direction:column;
        border-left:1px solid black;
        padding:5px;
        width:20%'> 
            <table>"""
    
    for k, v in col['prop'].items():
        right += f"""
                <tr>
                    <td style="text-align:right">{k}</td>
                    <td style="text-align:left">{v}</td>
                </tr>"""
    right +="</table> </span>"
    center = drawplot(table,col,con)
    htmlstring = f"<div style='display:flex;justify-content:space-around;border:1px solid black;width:100%'> {left} {center} {right}</div>"
    display(HTML(htmlstring))
    #get data
    
    


def drawplot(table,col,con):
    
    data = []
    
    plt.cla()
    plt.clf()
    #decide    
    
    
    #if less than 5 unique values, use piechart
    if col['plot'] == 'pie':

        label = []
        res = con.execute(f'''SELECT {col['name']} as name, COUNT({col['name']}) as count from {table} GROUP BY {col['name']} ORDER BY COUNT({col['name']}) DESC''')
        for row in res:
            data.append(float(row['count']))
            label.append(row['name'])
            
        plt.pie(data, labels=label,startangle = 90)
        plt.axis('equal')

        f = io.StringIO()
        plt.savefig(f, format = "svg")
        return f"<span style='width:60%'>{f.getvalue()}</span>"

        
    #if more than 5 & datatype float, use histogram
    elif col['plot'] == 'hist' or col['plot'] == 'histdate':
        #determine number of bins
        nBins = 30
        if col['prop']['nUnique'] < 10:
            nBins = col['prop']['nUnique']
        elif col['prop']['nUnique'] >= 10 and col['prop']['nUnique'] < 30:
            nBins = col['prop']['nUnique']/2
        
        res = con.execute(f'''SELECT {col['name']} as name from {table} ORDER BY {col['name']} ASC''')
        for row in res:
            if row['name'] is not None:
                if col['plot'] == 'hist':
                    data.append(float(row['name']))
                elif col['plot'] == 'histdate':
                    data.append(row['name'].timestamp())
        
        plt.hist(data, color = 'blue', edgecolor = 'black',bins = int(nBins))
    
        f = io.StringIO()
        plt.savefig(f, format = "svg")
        return f"<span style='width:60%'>{f.getvalue()}</span>"
        
    #if only one unique value, show it    
    elif col['plot'] == 'oneval':
        res = con.execute(f'''SELECT {col['name']} from {table} LIMIT 1''').fetchone()[0]
        return f"<span style='width:60%;text-align:center'>{res}</span>"
        
    #list 5 most common entries
    else:
        res = con.execute(f'''SELECT {col['name']} as name, COUNT({col['name']}) as count from {table} GROUP BY {col['name']} ORDER BY COUNT({col['name']}) DESC LIMIT 5''')
        hatml = '<span style="width:60%"><table style="width:100%">'
        for row in res:
            perc = round(100*(row['count']/col['prop']['len']),2)
            hatml += f'<tr><td style="text-align:right">{row["name"]}</td><td style="text-align:left">{perc}%</td></tr>'
        hatml += '</table></span>'
        return hatml
    #else use nothing