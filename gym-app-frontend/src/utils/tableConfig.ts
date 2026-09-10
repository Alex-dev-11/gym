export const tablePagination = {
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: (total: number) => `Всего записей: ${total}`,
  // Переопределяем английский текст "items per page" на русский
  locale: { items_per_page: "на стр." },
};

