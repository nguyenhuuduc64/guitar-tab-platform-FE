export const artistSchema = [
    {
        name: "name",
        label: "Tên nghệ sĩ",
        type: "text",
        placeholder: "Nhập tên...",
        validation: { required: "Không được để trống" },
    },

    {
        name: "description",
        label: "Tiểu sử",
        type: "editor",
    },
];
