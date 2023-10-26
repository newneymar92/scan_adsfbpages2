import { LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Select, Spin, Table, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TableCustom = () => {
  const [nextLink, setNextLink] = useState("");
  const [tempData, setTempData] = useState([]);
  const [isAutoScan, setIsAutoScan] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [rangePick, setRangePick] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowClick = async (record) => {
    try {
      const isSelected = selectedRows.includes(record.index);

      const newSelectedRows = isSelected
        ? selectedRows.filter((key) => key !== record.index)
        : [...selectedRows, record.index];

      setSelectedRows(newSelectedRows);
      await axios.post("https://baocon.click/page", {
        pageUrl: record.page_id,
      });
      message.success("Add clicked page success");
    } catch (error) {
      message.error("Add clicked page fail");
    }
  };
  const handleChangeRangePick = (value) => {
    setRangePick(value);
  };

  const openNextTab = () => {
    if (currentIndex < dataSource.length) {
      for (let index = 0; index < rangePick; index++) {
        window.open(
          `https://mbasic.facebook.com/${
            dataSource[currentIndex + index].page_id
          }`,
          "_blank"
        );
        setCurrentIndex(currentIndex + rangePick);
      }
    }
  };

  const resetTabs = () => {
    setCurrentIndex(0);
  };

  const handleFilterDataSource = (dataTemp, listPagesClicked) => {
    const filteredDataArray = dataTemp.reduce((acc, item) => {
      const isDuplicate = acc.some(
        (existingItem) => existingItem.page_id === item.page_id
      );
      if (!isDuplicate) {
        acc.push(item);
      }
      return acc;
    }, []);
    const result = filteredDataArray.filter(
      (item) => !listPagesClicked.includes(item.page_id)
    );
    const dataSource = result.map((item, index) => {
      return { ...item, index };
    });
    return dataSource;
  };

  const handleSearch = async (value) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://graph.facebook.com/v18.0/ads_archive",
        {
          params: {
            access_token:
              "EAAOYsQgkMfEBO7OQGxZBunIXRows53005BYW0eYzAFNqQT9680rVKW3jKnA22tbFJk7ZA6sRZBSPmleWOoUmYdqZCeWpcZClV4RVZADJuZC8Kqrdbxf7WEGzwZBRjDuRBs7lt7oAVAp98PcBuI0w1tnmiRsSVetZBolIoJZCoOIZA8CqldqbqLGr4lZCZBEDic2mtO6dA9zXfKbt9",
            search_terms: value?.search_terms,
            ad_type: "ALL",
            search_type: "KEYWORD_EXACT_PHRASE",
            ad_reached_countries: [`${value?.ad_reached_countries}`],
            limit: 20,
            ad_active_status: "ACTIVE",
          },
        }
      );
      if (res.data) {
        setNextLink(res.data.paging.next);
        setIsAutoScan(!isAutoScan);
        setTempData((prev) => [...prev, ...res.data.data]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      title: "Số thứ tự",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "ID trang",
      dataIndex: "page_id",
      key: "page_id",
    },
    {
      title: "Địa chỉ trang",
      dataIndex: "page_id",
      key: "link_page",
      render: (page_id) => (
        <div>
          <Link to={`https://www.facebook.com/${page_id}`} target="_blank">
            https://www.facebook.com/${page_id}
          </Link>
        </div>
      ),
    },
    {
      title: "Mở theo mbasic",
      dataIndex: "page_id",
      key: "button1",
      render: (page_id) => (
        <div>
          <Button
          type="primary"
          size="large"
            onClick={() => {
              window.open(`https://mbasic.facebook.com/${page_id}`, "_blank");
            }}
          >
            Open mbasic
          </Button>
        </div>
      ),
    },
    {
      title: "Mở theo www",
      dataIndex: "page_id",
      key: "button2",
      render: (page_id) => (
        <div>
          <Button
          type="primary"
          size="large"
            onClick={() => {
              window.open(`https://www.facebook.com/${page_id}`, "_blank");
            }}
          >
            Open www
          </Button>
        </div>
      ),
    },
  ];

  const handlePause = async () => {
    try {
      const res = await axios.get("https://baocon.click/page");
      const listPagesClicked = res.data.data.map((item) => item.pageUrl);
      const result = handleFilterDataSource(tempData, listPagesClicked);
      setDataSource(result);
      setIsAutoScan(!isAutoScan);
    } catch (error) {
      const result = handleFilterDataSource(tempData, []);
      setDataSource(result);
      setIsAutoScan(!isAutoScan);
    }
  };

  const handleAutoScan = async (nextLink) => {
    const res = await axios.get(nextLink);
    if (res.data) {
      setNextLink(res.data.paging.next);
      setTempData((prev) => [...prev, ...res.data.data]);
    }
  };

  useEffect(() => {
    if (!isAutoScan) {
      handleAutoScan(nextLink);
    }
  }, [isAutoScan, nextLink]);


  return (
    <Spin
      spinning={loading}
      indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          initialValues={{}}
          onFinish={handleSearch}
          style={{ margin: "20px", maxWidth: 1000 }}
        >
          {/* <Form.Item name="access_token" label="Access Token">
            <Input />
          </Form.Item> */}
          <Form.Item name="search_terms" label="Từ khóa">
            <Input />
          </Form.Item>
          <Form.Item name="ad_reached_countries" label="Quốc gia">
            <Input />
          </Form.Item>
          <Form.Item></Form.Item>
          <Row style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <Button type="primary" htmlType="submit">
              Tìm kiếm
            </Button>
            <Button onClick={handlePause}>
              {isAutoScan ? "Tiếp tục" : "Dừng"}
            </Button>
            <Button
              onClick={openNextTab}
              disabled={currentIndex === dataSource.length}
            >
              Mở {rangePick} trang liên tiếp
            </Button>
            <Select
              style={{ width: "100px" }}
              options={[
                { key: 1, value: 1, label: "1 trang" },
                { key: 2, value: 10, label: "10 trang" },
                { key: 3, value: 20, label: "20 trang" },
                { key: 4, value: 30, label: "30 trang" },
                { key: 5, value: 40, label: "40 trang" },
                { key: 6, value: 50, label: "50 trang" },
              ]}
              onChange={handleChangeRangePick}
            />
            <Button onClick={resetTabs}>Đặt lại </Button>
          </Row>
        </Form>
        <div style={{display:"flex"}}>
        <div style={{ margin: "20px", fontSize: "24px" }}>
          Số thứ tự trang hiện tại (khi chọn mở liên tiếp): {currentIndex && currentIndex - 1}
        </div>
        <div style={{ margin: "20px", fontSize: "24px" }}>
          Tổng số trang đã quét: {tempData.length}
        </div>
         <div style={{ margin: "20px", fontSize: "24px" }}>
          Tổng số trang đã lọc: {dataSource.length}
        </div>
        </div>
        
        <Table
          scroll={{ y: 500 }}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName={(record) => {
            const isSelected = selectedRows.includes(record.index);

            return isSelected ? "selected-row" : "";
          }}
        />
      </div>
    </Spin>
  );
};
export default TableCustom;
