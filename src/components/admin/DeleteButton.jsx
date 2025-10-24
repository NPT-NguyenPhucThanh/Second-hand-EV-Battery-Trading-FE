import { DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

export default function DeleteButton(props) {
    const{record, onReload} = props
    const handleDelete = async () =>{
        const response = await delete(record.id);
        if(response){
            onReload();
            alert("Xóa thành công");
        }else{
            alert("Xóa thất bại");
        }
    }
  return (
    <>
        <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={handleDelete}>
            <Button size="small" danger>
                <DeleteOutlined />
            </Button>
        </Popconfirm>
    </>
  )
}
