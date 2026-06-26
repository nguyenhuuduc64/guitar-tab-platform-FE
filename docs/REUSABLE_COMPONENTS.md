# Reusable Components Guide

Tai lieu nay tom tat cac component quan trong trong source code hien tai, muc dich su dung va cach dung co ban. Muc "Muc do tai su dung" giup phan biet component co the dung lai ngay voi component can tach bot logic API/router truoc khi dung rong.

## Nhom UI Primitive

| Component | File | Cong dung | Muc do tai su dung |
| --- | --- | --- | --- |
| `Button` | `src/components/ui/button.tsx` | Nut chuan cua design system, ho tro variant, size va `asChild`. | Cao |
| `Input` | `src/components/ui/Input.tsx` | Input co style thong nhat, nhan tat ca props cua HTML input. | Cao |
| `Card` va cac subcomponent | `src/components/ui/Card.tsx` | Khung noi dung gom `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`. | Cao |
| `Badge` | `src/components/ui/Badge.tsx` | Nhan trang thai/tag nho, ho tro variant va `asChild`. | Cao |
| `Avatar` | `src/components/ui/Avatar.tsx` | Avatar, fallback, badge, group avatar. | Cao |
| `Table` va cac subcomponent | `src/components/ui/table.tsx` | Bang du lieu co style co ban, co wrapper overflow ngang. | Cao |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | Menu theo Radix UI: item, checkbox item, radio item, submenu. | Cao |
| `AlertDialog` primitives | `src/components/ui/alert-dialog.tsx` | Dialog xac nhan theo Radix UI. | Cao |
| `Switch` | `src/components/ui/switch.tsx` | Toggle boolean. | Cao |
| `Separator` | `src/components/ui/separator.tsx` | Duong phan cach ngang/doc. | Cao |
| `Pagination` | `src/components/ui/pagination.tsx` | Cac primitive phan trang: previous, next, ellipsis, link. | Cao |
| `ThemeToggle` | `src/components/ui/ThemeToggle.tsx` | Nut doi dark/light theme qua `ThemeContext`. | Trung binh |

### Button

Dung cho hanh dong chinh, nut icon, link button hoac nut boc component khac.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="sm" onClick={handleSave}>
  Luu
</Button>

<Button variant="ghost" size="icon" aria-label="Mo menu">
  <MoreHorizontal />
</Button>
```

Props dang chu y:

- `variant`: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- `size`: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- `asChild`: dung khi muon render thanh element con, vi du link

### Card

Dung cho cac khoi noi dung co header/body/footer.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

<Card>
  <CardHeader>
    <CardTitle>Thong tin bai hat</CardTitle>
    <CardDescription>Cap nhat lan cuoi hom nay</CardDescription>
  </CardHeader>
  <CardContent>Noi dung</CardContent>
  <CardFooter>Hanh dong</CardFooter>
</Card>
```

### Avatar

Dung cho avatar user, avatar group, hien thi fallback khi anh loi.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";

<Avatar size="lg">
  <AvatarImage src={user.imageUrl} alt={user.fullName} />
  <AvatarFallback>{user.fullName?.[0] || "U"}</AvatarFallback>
</Avatar>
```

## Nhom Common Business Components

| Component | File | Cong dung | Muc do tai su dung |
| --- | --- | --- | --- |
| `ChordViewer` | `src/components/common/ChordViewer.tsx` | Hien thi chord sheet, parse inline chords `[C]`, popup so do bam hop am, auto scroll. | Cao nhung co coupling |
| `GuitarChordDiagram` | `src/components/chords/GuitarChordDiagram.tsx` | Ve so do bam guitar, doi the bam va transpose tone. | Cao |
| `SongTable` | `src/components/common/SongTable.tsx` | Danh sach bai hat/chord dang card list, co loading/error/empty state. | Cao nhung co router coupling |
| `DynamicForm` | `src/components/common/DynamicForm.tsx` | Modal form tao tu schema, dung `react-hook-form` va `useFormStore`. | Trung binh cao |
| `SchemaFormField` | `src/components/common/SchemaFormField.tsx` | Render field theo schema: input, textarea, select, file, nested children. | Cao khi dung chung voi `DynamicForm` |
| `AlertDialogDemo` | `src/components/common/AlertDialog.tsx` | Wrapper dialog xac nhan hanh dong nhanh. | Cao |
| `ConfigAudioModal` | `src/components/common/ConfigAudioModal.tsx` | Modal luu bai nhac/audio AI vao thu vien, chon category/collection/artist/public. | Trung binh, coupling API cao |
| `AudioGrid` | `src/components/common/AudioGrid.tsx` | Grid audio moi/featured, lay du lieu tu API `/audios`. | Trung binh, coupling API cao |
| `Comment` | `src/components/common/comment/Comment.tsx` | Hien thi mot comment, like, reply, share, edit/delete neu la owner. | Cao |
| `CommentList` | `src/components/common/comment/CommentList.tsx` | Render danh sach comment, map callback theo `comment.id`. | Cao |
| `CommentForm` | `src/components/common/comment/CommentForm.tsx` | Form tao comment qua API `/comments`. | Trung binh |
| `Post` | `src/components/common/post/Post.tsx` | Card bai viet cong dong, audio, chord, like, comment, image. | Trung binh cao, nhieu logic |
| `SidebarProfileUser` | `src/components/common/SidebarProfileUser.tsx` | Sidebar thong tin profile user theo `userId`. | Trung binh |

### ChordViewer

Dung khi can hien thi noi dung hop am co format inline chord, vi du `[C]Ngay mai [G]troi sang`.

```tsx
import ChordViewer from "@/components/common/ChordViewer";

<ChordViewer
  chord={{
    id: "song-1",
    title: "Ten bai hat",
    content: "[Verse 1]\n[C]Ngay nang [G]xanh",
    artistId: "artist-1",
  }}
  onOpenPlaylist={() => setPlaylistOpen(true)}
/>
```

Props:

- `chord.id?`: id bai hat
- `chord.title?`: ten bai hat
- `chord.content`: noi dung chord sheet, bat buoc
- `chord.artistId?`: neu co se fetch thong tin nghe si bang `getArtistById`
- `onOpenPlaylist?`: callback khi bam "Them playlist"

Ghi chu:

- Component tu fetch artist va dung `useNavigate`, nen khi dung o noi khong co router se loi.
- Popup hop am phu thuoc `GuitarChordDiagram` va `getChordData`.
- Neu muon tai su dung rong hon, nen tach `artist` va callback navigate ra props.

### GuitarChordDiagram

Dung doc lap de hien thi so do bam cua mot hop am.

```tsx
import GuitarChordDiagram from "@/components/chords/GuitarChordDiagram";

<GuitarChordDiagram initialChordName="Am" />
```

Props:

- `initialChordName`: ten hop am, mac dinh `"C"`

Ghi chu:

- Du lieu lay tu `src/constants/chords.ts`.
- Co state noi bo cho transpose va bien the the bam.

### SongTable

Dung cho danh sach bai hat/chord. Ten component la `SongTable` nhung UI hien tai la card list.

```tsx
import { SongTable } from "@/components/common/SongTable";

<SongTable
  songs={songs}
  loading={isLoading}
  error={errorMessage}
  isHasMenu
/>
```

Props:

- `songs`: mang `Chord[]`
- `loading?`: hien thi loading state
- `error?`: hien thi loi
- `isHasMenu?`: hien nut 3 cham tren tung item

Ghi chu:

- Click item se `navigate(/song/:id)`, vi vay component can nam trong React Router.
- Component tu extract tag hop am tu content bang regex `[x]`.

### DynamicForm va SchemaFormField

Dung khi can tao form nhanh tu schema. `DynamicForm` chi hien khi `useFormStore().openFormName` trung voi `name`.

```tsx
import { DynamicForm } from "@/components/common/DynamicForm";
import type { FieldConfig } from "@/types/SchemaFormProps";

const schema: FieldConfig[] = [
  {
    name: "title",
    label: "Ten bai hat",
    type: "text",
    validation: { required: "Bat buoc nhap ten bai hat" },
  },
  {
    name: "category",
    label: "Danh muc",
    type: "select",
    options: [
      { label: "Pop", value: "pop" },
      { label: "Rock", value: "rock" },
    ],
  },
];

<DynamicForm
  name="song-form"
  schema={schema}
  defaultValues={{ title: "" }}
  onSubmit={(data) => console.log(data)}
/>
```

Field types dang ho tro:

- `text`, `email`, `password`, `number`
- `textarea`
- `select`
- `file`
- `children` de tao group field long nhau

Ghi chu:

- `DynamicForm` dang nhan props kieu `any`; nen thay bang `SchemaFormProps` de type-safe hon.
- `SchemaFormField` dang phu thuoc `FormProvider` cua `react-hook-form`.

### AlertDialogDemo

Wrapper de hoi xac nhan truoc khi lam hanh dong nguy hiem.

```tsx
import { AlertDialogDemo } from "@/components/common/AlertDialog";

<AlertDialogDemo
  buttonName="Xoa"
  title="Xoa bai hat"
  message="Ban co chac muon xoa bai hat nay?"
  variant="destructive"
  onSubmit={handleDelete}
/>
```

Props:

- `buttonName`: text hoac ReactNode lam trigger
- `message`: noi dung dialog
- `title?`: tieu de, mac dinh la xac nhan hanh dong
- `onSubmit`: callback khi dong y
- `variant?`: `default`, `destructive`, `outline`
- `className?`: class them cho trigger button

### ConfigAudioModal

Dung trong flow AI de luu audio va lyrics/chord thanh bai hat trong thu vien.

```tsx
import { ConfigAudioModal } from "@/components/common/ConfigAudioModal";

<ConfigAudioModal
  isOpen={open}
  onClose={() => setOpen(false)}
  chordId={track.id}
  audioUrl={track.audioUrl}
  initialLyrics={track.lyrics || ""}
  onSaveSuccess={() => refetchSongs()}
/>
```

Props:

- `isOpen`: bat/tat modal
- `onClose`: dong modal
- `chordId`: id lien quan den track/chord
- `audioUrl`: file audio can luu
- `initialLyrics`: lyrics hoac chord sheet mac dinh
- `onSaveSuccess`: callback sau khi luu thanh cong

Ghi chu:

- Component tu goi API `/categories`, `/collections`, `/artists`, `/chords`, `/audios`.
- Nen dung trong flow co backend day du. Neu muon reusable, nen dua API calls ra ngoai thanh props/service.

### Comment, CommentList, CommentForm

Dung cho khu vuc binh luan.

```tsx
import CommentList from "@/components/common/comment/CommentList";
import CommentForm from "@/components/common/comment/CommentForm";

<CommentList
  comments={comments}
  currentUserId={currentUser.id}
  onEdit={(commentId, content) => updateComment(commentId, content)}
  onDelete={(commentId) => deleteComment(commentId)}
/>

<CommentForm
  postId={post.id}
  userId={currentUser.id}
  onCommentCreated={refetchComments}
/>
```

Ghi chu:

- `Comment` va `CommentList` reusable tot vi nhan callbacks tu ben ngoai.
- `CommentForm` tu goi `POST /comments`, nen co coupling API.

### Post

Card bai viet day du cho trang community: hien user, noi dung, anh, audio, chord viewer, like va comments.

```tsx
import Post from "@/components/common/post/Post";

<Post
  post={post}
  currentUserId={currentUser.id}
  likeCount={likeCount}
  commentCount={commentCount}
  isLiked={isLiked}
  comments={comments}
  showComments={showComments}
  loadingComments={loadingComments}
  onLike={handleLike}
  onToggleComments={handleToggleComments}
  onCommentCreated={handleCommentCreated}
  onDeleteComment={handleDeleteComment}
  onEditComment={handleEditComment}
  formatTimeAgo={formatTimeAgo}
/>
```

Ghi chu:

- Component kha manh vi gom nhieu UI con.
- Dang fetch them thong tin user/chord noi bo bang `instance`; neu can dung o nhieu page, nen tach thanh `PostCard` hien thi thuan va hook fetch rieng.

## Nhom Layout Va Navigation

| Component | File | Cong dung | Muc do tai su dung |
| --- | --- | --- | --- |
| `DefaultLayout` | `src/layouts/user/DefaultLayout.tsx` | Layout user public/private gom `Navigation`, `SubNavigation`, vung content. | Cao trong user routes |
| `AdminDefaultLayout` | `src/layouts/admin/AdminDefaultLayout.tsx` | Layout admin gom sidebar, top header, content scroll. | Cao trong admin routes |
| `AdminSidebar` | `src/components/common/AdminSidebar.tsx` | Sidebar admin responsive, collapse/expand, route active. | Cao trong admin |
| `AiSidebar` | `src/components/common/AiSidebar.tsx` | Sidebar cho AI composer, dieu huong text2melody/melody2chord. | Trung binh |
| `Navigation` | `src/layouts/user/Navigation.tsx` | Header/navigation chinh cua user site. | Cao trong user layout |
| `SubNavigation` | `src/layouts/user/SubNavigation.tsx` | Thanh sub navigation ben duoi nav chinh. | Trung binh |
| `TopHeader` | `src/components/common/TopHeader.tsx` | Header tren admin layout. | Trung binh |

### AdminDefaultLayout va AdminSidebar

Dung cho route admin trong `src/App.tsx`.

```tsx
import AdminDefaultLayout from "@/layouts/admin/AdminDefaultLayout";

<AdminDefaultLayout>
  <ArtistManagement />
</AdminDefaultLayout>
```

`AdminSidebar` nhan state tu layout:

```tsx
<AdminSidebar
  open={open}
  setOpen={setOpen}
  collapsed={collapsed}
  setCollapsed={setCollapsed}
/>
```

Ghi chu:

- Menu lay tu `src/constants/sidebar.ts`.
- Dung `useLocation` de active theo pathname va `useNavigate` de chuyen route.

### DefaultLayout

Dung cho route user. Hien tai layout dat content bang `absolute top-[calc(var(--header-height)+32px)]`, nen cac page full-screen can tinh chieu cao tru di dung offset nay.

```tsx
<DefaultLayout>
  <Home />
</DefaultLayout>
```

Ghi chu:

- Neu tao page co `h-screen` ben trong layout nay, de y se tao scrollbar vi content da bi day xuong duoi header.
- Nen dung `h-[calc(100vh-var(--header-height)-32px)]` cho page can full viewport trong user layout.

## Context Va Hook Co The Dung Lai

| Ten | File | Cong dung | Cach dung |
| --- | --- | --- | --- |
| `ThemeProvider`, `useTheme` | `src/context/ThemeContext.tsx` | Quan ly dark/light theme, sync vao `localStorage` va class tren `html`. | Boc app bang provider, goi `useTheme()` trong component con |
| `useDebounce` | `src/hooks/useDebounce.ts` | Delay gia tri input truoc khi trigger search/API. | `const debounced = useDebounce(keyword, 400)` |

### ThemeProvider va ThemeToggle

```tsx
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

<ThemeProvider>
  <App />
</ThemeProvider>

<ThemeToggle />
```

### useDebounce

```tsx
import { useDebounce } from "@/hooks/useDebounce";

const debouncedKeyword = useDebounce(keyword, 400);

useEffect(() => {
  if (!debouncedKeyword) return;
  searchArtists(debouncedKeyword);
}, [debouncedKeyword]);
```

## Component Nen Refactor De Tai Su Dung Tot Hon

| Component | Van de hien tai | Huong refactor |
| --- | --- | --- |
| `ChordViewer` | Tu fetch artist va tu navigate, kho test doc lap. | Nhan `artist`, `onArtistClick`, `onFavorite`, `onOpenPlaylist` tu props. |
| `SongTable` | Click item hard-code `/song/:id`. | Them prop `onSongClick` hoac `getSongHref`. |
| `ConfigAudioModal` | Chua nhieu API call truc tiep. | Tach thanh `ConfigAudioForm` thuan UI va hook/service luu du lieu. |
| `AudioGrid` | Tu fetch `/audios`, layout fix 5 item, anh hard-code. | Nhan `audios`, `loading`, `onAudioClick` tu props. |
| `Post` | Gom UI, API fetch user/chord, comment form/list vao mot component lon. | Tach `PostCard`, `PostAudio`, `PostComments`, `usePostMeta`. |
| `DynamicForm` | Props dang `any`. | Dung `SchemaFormProps`, type cho `schema`, `defaultValues`, `onSubmit`. |
| `AlertDialogDemo` | Ten demo khong phu hop production. | Doi ten thanh `ConfirmDialog` hoac `ConfirmAction`. |

## Goi Y Khi Tao Component Moi

- Neu component chi hien thi UI, uu tien nhan du lieu va callback qua props, khong goi API truc tiep.
- Neu component can router, nen nhan `onClick`/`href` tu ngoai tru khi no la layout/navigation co chu dich.
- Neu component can fetch du lieu, can nhac tach thanh hook `useXxx` va component UI thuan.
- Dung cac primitive trong `src/components/ui` truoc khi tu viet lai button/input/card.
- Khi tao list/card moi cho bai hat, nen tai su dung `SongTable` hoac tach logic extract chord tag tu `SongTable`.
- Khi hien thi hop am, uu tien `ChordViewer`; khi chi can so do hop am nho, dung `GuitarChordDiagram`.
