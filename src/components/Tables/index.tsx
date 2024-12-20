import { useEffect, useState , useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Paginator } from 'primereact/paginator';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FaAngleDown } from "react-icons/fa6";
import "./index.css"
import { TailSpin } from "react-loader-spinner";

const dataStatus = {
    inProgress : "InProgress",
    fetched : "Fetched",
    notFetched : "notFetched"
}

const Tables = () => {
    const [currentPage , setCurrentPage] = useState(1)
    const [status , setStatus] = useState(dataStatus.inProgress)
    const [pageData , changePage] = useState<Items[]>([])
    const [checkedItems , setCheckedItem] = useState<number[]>([])
    const op = useRef<OverlayPanel>(null);
    const [value, setValue] = useState<number>(0);
    const [headerChecked , setHeaderChecked] = useState<boolean>(false)

    const addChecked = (event: CheckboxChangeEvent): void => {
        const { id } = event.target; 
        const checkboxId = Number(id);
        console.log(event.checked)
        if (event.checked){
            setCheckedItem((prevCheckedItems) => [
                ...prevCheckedItems,
                checkboxId, 
            ]);
        }
        else{
            
            setCheckedItem((prevCheckedItems) => prevCheckedItems.filter(each => each !== checkboxId))
        }
        
        
        console.log("Checkbox ID:", id);
    };

    interface Items {
        id: number;
        title: string;
        place_of_origin: string;
        artist_display: string;
        inscriptions: string | null;
        date_start: number;
        date_end: number;
        isChecked : boolean
    }


    const getData = async ()=>{
        setStatus(dataStatus.inProgress)
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`)


        if (response.ok){
            const data = await response.json()
            
            const arr = data.data.map((each:Items) => ({
                id : each.id,
                title : each.title,
                placeOfOrigin : each.place_of_origin,
                artistDisplay : each.artist_display,
                inscriptions : each.inscriptions,
                dateStart : each.date_start,
                dateEnd : each.date_end,
                isChecked : false

            }))
            const checkIfChecked =  arr.map((each : Items) => {
                if (checkedItems.includes(each.id)){
                    console.log("yes")
                    return {
                        ...each,
                        isChecked: checkedItems.includes(each.id),
                    }
                }
                console.log("no")
                return each 
            })
            
            console.table(data)

            changePage(checkIfChecked)
            setStatus(dataStatus.fetched)
        }
        else{
            setStatus(dataStatus.notFetched)
        }  
    }

    useEffect(()=>{
        getData()
    },[currentPage])

    useEffect(()=>{
        addcheckedData()
        console.log("called by addChecked")
    },[checkedItems])

    
    const addcheckedData = ()=>{
        const arr2 = pageData.map((each : Items) => {
            if (checkedItems.includes(each.id)){
                console.log("id present")
                return {
                    ...each,
                    isChecked : true 
                }
            }
            console.log("id not present")
            return {
                ...each,
                isChecked : false
            }
        })

        changePage(arr2)
    }

    const OnSubmitMultiPageSelection = async () => {
        let requiredRows = value; 
        const rowsPerPage = 12; 
        let allSelectedRows: Items[] = []; 
        let currentPageData = [...pageData]; 
    
        
        const currentPageRows = currentPageData.slice(0, Math.min(requiredRows, rowsPerPage));
        allSelectedRows = [...currentPageRows];
        requiredRows -= currentPageRows.length;
    
        
        let page = currentPage + 1;
        while (requiredRows > 0) {
            const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
            if (response.ok) {
                const data = await response.json();
                const nextPageData: Items[] = data.data.map((each: Items) => ({
                    id: each.id,
                    title: each.title,
                    placeOfOrigin: each.place_of_origin,
                    artistDisplay: each.artist_display,
                    inscriptions: each.inscriptions,
                    dateStart: each.date_start,
                    dateEnd: each.date_end,
                    isChecked: false,
                }));
    
                
                const nextPageRows = nextPageData.slice(0, Math.min(requiredRows, rowsPerPage));
                allSelectedRows = [...allSelectedRows, ...nextPageRows];
                requiredRows -= nextPageRows.length;
                page++;
                if (checkedItems.length === 0 ){
                    setHeaderChecked(false)
                }
                
            } else {
                break; 
            }
        }
    
        
        const updatedData = pageData.map((row) => ({
            ...row,
            isChecked: allSelectedRows.some((selected) => selected.id === row.id),
        }));
        changePage(updatedData);
    
        
        const selectedIds = allSelectedRows.map((row) => row.id);
        setCheckedItem(selectedIds);
    };
    
    const tables = ()=>{
        return (
            <div className="card">
            <DataTable value={pageData} rows={12}  tableStyle={{ minWidth: '50rem' , padding : "16px" , textAlign : "center"}}>
            <Column
                    body={(rowdata)=>(<Checkbox onChange={addChecked} checked={rowdata.isChecked } id={rowdata.id}></Checkbox>
                        
                    )}
                    header={(<div className="header_checkbox">
                        <Checkbox checked={headerChecked} id="headCheckBox" onClick={(e) => op.current?.toggle(e)} onChange={()=>setHeaderChecked((prev) => !prev)}></Checkbox>
                        <button type="button" onClick={(e) => op.current?.toggle(e)} className="overlay-btn"><FaAngleDown /></button>
                        <OverlayPanel ref={op}>
    <div className="input_con">
        <input
            type="number"
            name="number"
            id="number"
            max={pageData.length} 
            onChange={(e) => setValue(Number(e.target.value))}
        />
        <button type="button" onClick={OnSubmitMultiPageSelection}>
            Submit
        </button>
    </div>
</OverlayPanel>
                    </div>
                )}
                    style={{ width: '10%' }}
                />
                <Column field="title" header="Title" style={{ width: '10%' , textAlign : "center"}}></Column>
                <Column field="placeOfOrigin" header="Place of Origin" className="column" style={{ width: '25%' , textAlign : "center"}}></Column>
                <Column field="artistDisplay" header="Artist Display" className="column" style={{ width: '25%'}}></Column>
                <Column field="inscriptions" header="Inscriptions" className="column" style={{ width: '25%' }}></Column>
                <Column field="dateStart" header="Date Start" className="column" style={{ width: '10%' }}></Column>
                <Column field="dateEnd" header="Date End" className="column" style={{ width: '10%' }}></Column>
            </DataTable>
            <Paginator
                first={(currentPage - 1) * 12} 
                rows={12} 
                totalRecords={10528} 
                onPageChange={(e) => setCurrentPage(e.page + 1)} 
    />
        </div>
        )
    }

    switch (status) {
        case dataStatus.inProgress:
          return <div><TailSpin
            visible={true}
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            /></div>
          
        case dataStatus.fetched:
          return tables()
          
        default:
          return null
          
      }
}

export default Tables