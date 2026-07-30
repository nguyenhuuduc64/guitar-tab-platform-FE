import { type DashboardStats } from "../../../types/dashboard";
import { type Artist } from "../../../types/artist";

/**
 * Xuất dữ liệu thống kê hệ thống từ Dashboard thành file Excel (.xls) được định dạng chuyên nghiệp.
 * Định hình bảng dữ liệu rõ ràng, căn lề số liệu, mở rộng chiều rộng cột và tô màu tiêu đề bảng.
 */
export const exportDashboardToExcel = (stats: DashboardStats, artistsMap: Record<string, Artist>) => {
    // Nội dung HTML tương thích hoàn toàn với Excel, hỗ trợ CSS Styling
    const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <!--[if gte mso 9]>
        <xml>
            <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                        <x:Name>Thống kê Hatcungtoi</x:Name>
                        <x:WorksheetOptions>
                            <x:DisplayGridlines/>
                        </x:WorksheetOptions>
                    </x:ExcelWorksheet>
                </x:ExcelWorksheets>
            </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; }
            table { border-collapse: collapse; margin-bottom: 25px; }
            th { 
                background-color: #1E3A8A; 
                color: #ffffff; 
                border: 1px solid #CBD5E1; 
                padding: 10px; 
                font-weight: bold; 
                text-align: left; 
                font-size: 11pt;
            }
            td { 
                border: 1px solid #E2E8F0; 
                padding: 8px 10px; 
                color: #334155;
                font-size: 10pt;
            }
            .section-header { 
                font-size: 13pt; 
                font-weight: bold; 
                background-color: #F1F5F9; 
                color: #0F172A;
                padding: 12px 10px; 
                border: 1px solid #CBD5E1;
                text-align: left;
            }
            .title-cell { 
                font-size: 18pt; 
                font-weight: bold; 
                color: #1E3A8A; 
                text-align: center;
                padding: 20px 0;
            }
            .subtitle-cell {
                font-size: 10pt;
                color: #64748B;
                text-align: center;
                padding-bottom: 20px;
            }
            .number-cell { 
                text-align: right; 
            }
            .center-cell {
                text-align: center;
            }
            .bold-text {
                font-weight: bold;
            }
            .zebra-row {
                background-color: #F8FAFC;
            }
        </style>
    </head>
    <body>
        <table>
            <tr>
                <td colspan="5" class="title-cell" style="border: none;">BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HỆ THỐNG</td>
            </tr>
            <tr>
                <td colspan="5" class="subtitle-cell" style="border: none;">Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')} &nbsp;|&nbsp; Hệ thống: Hatcungtoi</td>
            </tr>
        </table>

        <!-- 1. TỔNG QUAN -->
        <table>
            <colgroup>
                <col width="300" style="width: 225pt;" />
                <col width="150" style="width: 112pt;" />
            </colgroup>
            <thead>
                <tr>
                    <th colspan="2" class="section-header">1. CHỈ SỐ TỔNG QUAN HỆ THỐNG</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="bold-text">Tổng số bài hát (Hợp âm) trên hệ thống</td>
                    <td class="number-cell bold-text" style="color: #1E3A8A;">${stats.totalChords.toLocaleString('vi-VN')}</td>
                </tr>
                <tr class="zebra-row">
                    <td class="bold-text">Tổng số nghệ sĩ đăng ký</td>
                    <td class="number-cell bold-text" style="color: #0D9488;">${stats.totalArtists.toLocaleString('vi-VN')}</td>
                </tr>
                <tr>
                    <td class="bold-text">Tổng lượt xem bài hát tích lũy</td>
                    <td class="number-cell bold-text" style="color: #EA580C;">${stats.totalViews.toLocaleString('vi-VN')}</td>
                </tr>
                <tr class="zebra-row">
                    <td class="bold-text">Tổng số thể loại bài hát</td>
                    <td class="number-cell bold-text">${stats.categoryStats.length.toLocaleString('vi-VN')}</td>
                </tr>
            </tbody>
        </table>

        <!-- 2. BÀI HÁT THỊNH HÀNH TRONG TUẦN -->
        <table>
            <colgroup>
                <col width="60" style="width: 45pt;" />
                <col width="350" style="width: 262pt;" />
                <col width="220" style="width: 165pt;" />
                <col width="150" style="width: 112pt;" />
            </colgroup>
            <thead>
                <tr>
                    <th colspan="4" class="section-header">2. BÀI HÁT THỊNH HÀNH TRONG TUẦN (LƯỢT XEM TĂNG CAO)</th>
                </tr>
                <tr>
                    <th style="text-align: center;">STT</th>
                    <th>Tên bài hát</th>
                    <th>Nghệ sĩ</th>
                    <th style="text-align: right;">Lượt xem tuần</th>
                </tr>
            </thead>
            <tbody>
                ${stats.trendingChords.length > 0 ? stats.trendingChords.slice(0, 10).map((chord, idx) => {
                    const artist = artistsMap[chord.artistId];
                    const isZebra = idx % 2 === 1 ? 'class="zebra-row"' : '';
                    return `
                        <tr ${isZebra}>
                            <td class="center-cell">${idx + 1}</td>
                            <td class="bold-text" style="color: #1E3A8A;">${chord.title}</td>
                            <td>${artist?.name || chord.artistName || 'Nghệ sĩ'}</td>
                            <td class="number-cell bold-text">${(chord.views || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                    `;
                }).join('') : `<tr><td colspan="4" style="text-align: center; color: #94A3B8;">Chưa có dữ liệu bài hát thịnh hành</td></tr>`}
            </tbody>
        </table>

        <!-- 3. TOP BÀI HÁT LƯỢT XEM CAO NHẤT -->
        <table>
            <colgroup>
                <col width="60" style="width: 45pt;" />
                <col width="350" style="width: 262pt;" />
                <col width="220" style="width: 165pt;" />
                <col width="150" style="width: 112pt;" />
                <col width="150" style="width: 112pt;" />
            </colgroup>
            <thead>
                <tr>
                    <th colspan="5" class="section-header">3. TOP 10 BÀI HÁT LƯỢT XEM CAO NHẤT HỆ THỐNG</th>
                </tr>
                <tr>
                    <th style="text-align: center;">STT</th>
                    <th>Tên bài hát</th>
                    <th>Nghệ sĩ</th>
                    <th style="text-align: right;">Tổng lượt xem</th>
                    <th style="text-align: center;">Ngày đăng tải</th>
                </tr>
            </thead>
            <tbody>
                ${stats.topChords.length > 0 ? stats.topChords.slice(0, 10).map((chord, idx) => {
                    const artist = artistsMap[chord.artistId];
                    const isZebra = idx % 2 === 1 ? 'class="zebra-row"' : '';
                    return `
                        <tr ${isZebra}>
                            <td class="center-cell">${idx + 1}</td>
                            <td class="bold-text">${chord.title}</td>
                            <td>${artist?.name || chord.artistName || 'Nghệ sĩ'}</td>
                            <td class="number-cell bold-text" style="color: #EA580C;">${(chord.views || 0).toLocaleString('vi-VN')}</td>
                            <td class="center-cell">${new Date(chord.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    `;
                }).join('') : `<tr><td colspan="5" style="text-align: center; color: #94A3B8;">Chưa có dữ liệu bài hát</td></tr>`}
            </tbody>
        </table>

        <!-- 4. NGHỆ SĨ NỔI BẬT TRONG TUẦN -->
        <table>
            <colgroup>
                <col width="60" style="width: 45pt;" />
                <col width="350" style="width: 262pt;" />
                <col width="200" style="width: 150pt;" />
            </colgroup>
            <thead>
                <tr>
                    <th colspan="3" class="section-header">4. TOP NGHỆ SĨ NỔI BẬT TRONG TUẦN</th>
                </tr>
                <tr>
                    <th style="text-align: center;">STT</th>
                    <th>Tên nghệ sĩ</th>
                    <th style="text-align: right;">Tổng lượt xem đóng góp</th>
                </tr>
            </thead>
            <tbody>
                ${stats.artistStats.length > 0 ? stats.artistStats.slice(0, 10).map((art, idx) => {
                    const isZebra = idx % 2 === 1 ? 'class="zebra-row"' : '';
                    return `
                        <tr ${isZebra}>
                            <td class="center-cell">${idx + 1}</td>
                            <td class="bold-text" style="color: #0F172A;">${art.artistName}</td>
                            <td class="number-cell bold-text" style="color: #0D9488;">${(art.totalViews || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                    `;
                }).join('') : `<tr><td colspan="3" style="text-align: center; color: #94A3B8;">Chưa có dữ liệu nghệ sĩ</td></tr>`}
            </tbody>
        </table>

        <!-- 5. PHÂN BỐ THEO THỂ LOẠI -->
        <table>
            <colgroup>
                <col width="60" style="width: 45pt;" />
                <col width="350" style="width: 262pt;" />
                <col width="200" style="width: 150pt;" />
            </colgroup>
            <thead>
                <tr>
                    <th colspan="3" class="section-header">5. PHÂN BỐ SỐ LƯỢNG BÀI HÁT THEO THỂ LOẠI</th>
                </tr>
                <tr>
                    <th style="text-align: center;">STT</th>
                    <th>Tên thể loại</th>
                    <th style="text-align: right;">Số lượng bài hát</th>
                </tr>
            </thead>
            <tbody>
                ${stats.categoryStats.length > 0 ? stats.categoryStats.map((cat, idx) => {
                    const isZebra = idx % 2 === 1 ? 'class="zebra-row"' : '';
                    return `
                        <tr ${isZebra}>
                            <td class="center-cell">${idx + 1}</td>
                            <td class="bold-text">${cat.categoryName}</td>
                            <td class="number-cell bold-text">${(cat.count || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                    `;
                }).join('') : `<tr><td colspan="3" style="text-align: center; color: #94A3B8;">Chưa có dữ liệu thể loại</td></tr>`}
            </tbody>
        </table>
    </body>
    </html>
    `;

    // Download
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bao_cao_thong_ke_he_thong_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
