/* C25 — one hundred authored construction blocks. Native art is drawn at 24x24.
   Fixed shapes are integer-sixteenth cuboids; older registry entries are untouched. */
(()=>{
'use strict';
const version='c25-crafted-blocks-v1';
const surfaces=[
  {
    "id": 249,
    "key": "rusticated_sandstone",
    "name": "Sa thạch chạm viền",
    "color": "#c7ac78",
    "tool": "pick",
    "hardness": 2.5,
    "useNote": "Khối nền sáng với mạch ngang lệch và viền đá đục sâu.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 249,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone"
    ]
  },
  {
    "id": 250,
    "key": "granite_fan_paving",
    "name": "Đá hoa cương lát quạt",
    "color": "#8a9696",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Các cung đá xếp nan quạt làm sân và lối rẽ.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 250,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving"
    ]
  },
  {
    "id": 251,
    "key": "limestone_longcourse",
    "name": "Đá vôi hàng dài",
    "color": "#c9c9af",
    "tool": "pick",
    "hardness": 2.6,
    "useNote": "Hàng đá dài xen viên ngắn, mạch vữa hẹp cho tường.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 251,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse"
    ]
  },
  {
    "id": 252,
    "key": "basalt_octagon_inlay",
    "name": "Bazan khảm bát giác",
    "color": "#4d5759",
    "tool": "pick",
    "hardness": 3.2,
    "useNote": "Bát giác bazan viền ngà và chốt đồng ở giao điểm.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 252,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay"
    ]
  },
  {
    "id": 253,
    "key": "ribbed_travertine",
    "name": "Đá travertine sọc rỗ",
    "color": "#c7b69a",
    "tool": "pick",
    "hardness": 2.7,
    "useNote": "Dải khoáng ngang và hốc nhỏ thành lớp cho bậc và cột.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 253,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine"
    ]
  },
  {
    "id": 254,
    "key": "slate_chevron",
    "name": "Đá phiến ghép chữ V",
    "color": "#66717c",
    "tool": "pick",
    "hardness": 2.9,
    "useNote": "Hai dải phiến xiên gặp nhau thành chữ V rõ.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 254,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_slate_chevron",
      "c25_slate_chevron",
      "c25_slate_chevron",
      "c25_slate_chevron",
      "c25_slate_chevron",
      "c25_slate_chevron"
    ]
  },
  {
    "id": 255,
    "key": "river_pebble_panel",
    "name": "Mảng cuội suối ghép",
    "color": "#a89e89",
    "tool": "pick",
    "hardness": 2.4,
    "useNote": "Cuội tròn nhiều cỡ nằm trong nền vữa tối.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 255,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_river_pebble_panel",
      "c25_river_pebble_panel",
      "c25_river_pebble_panel",
      "c25_river_pebble_panel",
      "c25_river_pebble_panel",
      "c25_river_pebble_panel"
    ]
  },
  {
    "id": 256,
    "key": "branch_white_marble",
    "name": "Cẩm thạch trắng vân nhánh",
    "color": "#dddcd0",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Mặt trắng yên với một vân xám chia nhánh, dùng cho sảnh.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 256,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble"
    ]
  },
  {
    "id": 257,
    "key": "fractured_green_marble",
    "name": "Cẩm thạch xanh vân gãy",
    "color": "#527f73",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Mạch kem góc cạnh cắt qua nền xanh đậm.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 257,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_fractured_green_marble",
      "c25_fractured_green_marble",
      "c25_fractured_green_marble",
      "c25_fractured_green_marble",
      "c25_fractured_green_marble",
      "c25_fractured_green_marble"
    ]
  },
  {
    "id": 258,
    "key": "rose_strata_stone",
    "name": "Đá hồng phân tầng",
    "color": "#b98476",
    "tool": "pick",
    "hardness": 2.5,
    "useNote": "Dải đá hồng lệch nhịp với lớp vàng nhạt mỏng.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 258,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_rose_strata_stone",
      "c25_rose_strata_stone",
      "c25_rose_strata_stone",
      "c25_rose_strata_stone",
      "c25_rose_strata_stone",
      "c25_rose_strata_stone"
    ]
  },
  {
    "id": 259,
    "key": "fossil_limestone",
    "name": "Đá vôi chạm hóa thạch",
    "color": "#b7ae94",
    "tool": "pick",
    "hardness": 2.6,
    "useNote": "Vỏ xoắn và gân lá khắc riêng trên đá, không phải quặng.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 259,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_fossil_limestone",
      "c25_fossil_limestone",
      "c25_fossil_limestone",
      "c25_fossil_limestone",
      "c25_fossil_limestone",
      "c25_fossil_limestone"
    ]
  },
  {
    "id": 260,
    "key": "cobalt_wave_ceramic",
    "name": "Gốm lam sóng nước",
    "color": "#3e6f99",
    "tool": "pick",
    "hardness": 2.2,
    "useNote": "Ba hàng sóng men lam viền ngà cho hồ và mái hiên.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 260,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic"
    ]
  },
  {
    "id": 261,
    "key": "terracotta_sun_disk",
    "name": "Gốm đất mặt trời",
    "color": "#b7754a",
    "tool": "pick",
    "hardness": 2.2,
    "useNote": "Đĩa mặt trời giữa ô, tia rộng và vòng chấm bao ngoài.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 261,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk"
    ]
  },
  {
    "id": 262,
    "key": "ivory_fan_relief",
    "name": "Gốm ngà phù điêu quạt",
    "color": "#dacead",
    "tool": "pick",
    "hardness": 2.3,
    "useNote": "Nan quạt bán tròn nổi bằng ba sắc men ngà.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 262,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_ivory_fan_relief",
      "c25_ivory_fan_relief",
      "c25_ivory_fan_relief",
      "c25_ivory_fan_relief",
      "c25_ivory_fan_relief",
      "c25_ivory_fan_relief"
    ]
  },
  {
    "id": 263,
    "key": "jade_bamboo_tile",
    "name": "Gốm ngọc đốt trúc",
    "color": "#688b69",
    "tool": "pick",
    "hardness": 2.3,
    "useNote": "Ba thân trúc có đốt và lá chéo, họa tiết tĩnh.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 263,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile"
    ]
  },
  {
    "id": 264,
    "key": "indigo_star_mosaic",
    "name": "Khảm chàm sao tám cánh",
    "color": "#626c9b",
    "tool": "pick",
    "hardness": 2.5,
    "useNote": "Sao tám cánh men ngà trên nền chàm với góc đất nung.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 264,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_indigo_star_mosaic",
      "c25_indigo_star_mosaic",
      "c25_indigo_star_mosaic",
      "c25_indigo_star_mosaic",
      "c25_indigo_star_mosaic",
      "c25_indigo_star_mosaic"
    ]
  },
  {
    "id": 265,
    "key": "ochre_basket_brick",
    "name": "Gạch vàng đan rổ",
    "color": "#bb9256",
    "tool": "pick",
    "hardness": 2.5,
    "useNote": "Cặp gạch dài xoay vuông góc như mối đan cho đường đi.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 265,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick"
    ]
  },
  {
    "id": 266,
    "key": "plum_octagon_ceramic",
    "name": "Gốm mận ô bát giác",
    "color": "#8e657d",
    "tool": "pick",
    "hardness": 2.2,
    "useNote": "Ô bát giác men mận và hình thoi ngà phân cách.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 266,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_plum_octagon_ceramic",
      "c25_plum_octagon_ceramic",
      "c25_plum_octagon_ceramic",
      "c25_plum_octagon_ceramic",
      "c25_plum_octagon_ceramic",
      "c25_plum_octagon_ceramic"
    ]
  },
  {
    "id": 267,
    "key": "chalk_flower_rosette",
    "name": "Gạch hoa cánh phấn",
    "color": "#c4bda6",
    "tool": "pick",
    "hardness": 2.2,
    "useNote": "Hoa bốn cánh xanh xám, tâm đất đỏ trên nền ngà.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 267,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_chalk_flower_rosette",
      "c25_chalk_flower_rosette",
      "c25_chalk_flower_rosette",
      "c25_chalk_flower_rosette",
      "c25_chalk_flower_rosette",
      "c25_chalk_flower_rosette"
    ]
  },
  {
    "id": 268,
    "key": "clinker_soldiercourse",
    "name": "Gạch sẫm hàng đứng",
    "color": "#815749",
    "tool": "pick",
    "hardness": 2.7,
    "useNote": "Gạch đứng có đầu sáng, ghép viền tường và cửa.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 268,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_clinker_soldiercourse",
      "c25_clinker_soldiercourse",
      "c25_clinker_soldiercourse",
      "c25_clinker_soldiercourse",
      "c25_clinker_soldiercourse",
      "c25_clinker_soldiercourse"
    ]
  },
  {
    "id": 269,
    "key": "pegged_oak_panel",
    "name": "Gỗ sồi ghép chốt",
    "color": "#a58150",
    "tool": "axe",
    "hardness": 1.6,
    "useNote": "Ván rộng có chốt vuông và đường mộng rõ.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 269,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel"
    ]
  },
  {
    "id": 270,
    "key": "bamboo_zigzag_weave",
    "name": "Tre đan zích zắc",
    "color": "#c2b16d",
    "tool": "axe",
    "hardness": 1.2,
    "useNote": "Nan tre sáng tối đan zích zắc, có mép buộc.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 270,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave"
    ]
  },
  {
    "id": 271,
    "key": "walnut_herringbone",
    "name": "Gỗ óc chó xương cá",
    "color": "#775840",
    "tool": "axe",
    "hardness": 1.6,
    "useNote": "Thanh nâu sẫm ghép xương cá, thớ chạy theo thanh.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 271,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_walnut_herringbone",
      "c25_walnut_herringbone",
      "c25_walnut_herringbone_cap",
      "c25_walnut_herringbone_cap",
      "c25_walnut_herringbone",
      "c25_walnut_herringbone"
    ]
  },
  {
    "id": 272,
    "key": "cedar_diagonal_frame",
    "name": "Gỗ tuyết tùng giằng chéo",
    "color": "#a77659",
    "tool": "axe",
    "hardness": 1.6,
    "useNote": "Khung viền và giằng chữ X tách khỏi nền ván.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 272,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame"
    ]
  },
  {
    "id": 273,
    "key": "birch_square_joinery",
    "name": "Gỗ bạch dương mộng vuông",
    "color": "#c7b788",
    "tool": "axe",
    "hardness": 1.4,
    "useNote": "Các khung vuông lồng nhau với chốt nhỏ ở góc.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 273,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_birch_square_joinery",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery"
    ]
  },
  {
    "id": 274,
    "key": "chestnut_scallop_shingle",
    "name": "Vảy gỗ dẻ lợp mái",
    "color": "#9d7450",
    "tool": "axe",
    "hardness": 1.5,
    "useNote": "Hai hàng vảy tròn chồng mí có đinh trên đỉnh.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 274,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_chestnut_scallop_shingle",
      "c25_chestnut_scallop_shingle",
      "c25_chestnut_scallop_shingle_cap",
      "c25_chestnut_scallop_shingle_cap",
      "c25_chestnut_scallop_shingle",
      "c25_chestnut_scallop_shingle"
    ]
  },
  {
    "id": 275,
    "key": "rattan_hex_weave",
    "name": "Mây đan mắt lục giác",
    "color": "#bba06a",
    "tool": "axe",
    "hardness": 1,
    "useNote": "Nan mây tạo mắt lục giác màu tối trên khối kín.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 275,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave_cap",
      "c25_rattan_hex_weave_cap",
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave"
    ]
  },
  {
    "id": 276,
    "key": "charred_parallel_wood",
    "name": "Gỗ hun rãnh dọc",
    "color": "#4c4c44",
    "tool": "axe",
    "hardness": 1.6,
    "useNote": "Rãnh dọc đen than và các vết nứt ngắn, bề mặt tĩnh.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 276,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_charred_parallel_wood",
      "c25_charred_parallel_wood",
      "c25_charred_parallel_wood_cap",
      "c25_charred_parallel_wood_cap",
      "c25_charred_parallel_wood",
      "c25_charred_parallel_wood"
    ]
  },
  {
    "id": 277,
    "key": "shipwood_nailboard",
    "name": "Ván thuyền ghép đinh",
    "color": "#849185",
    "tool": "axe",
    "hardness": 1.5,
    "useNote": "Ván bạc màu theo hàng, đầu đinh sẫm và thớ dài.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 277,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_shipwood_nailboard",
      "c25_shipwood_nailboard",
      "c25_shipwood_nailboard_cap",
      "c25_shipwood_nailboard_cap",
      "c25_shipwood_nailboard",
      "c25_shipwood_nailboard"
    ]
  },
  {
    "id": 278,
    "key": "paper_timber_lattice",
    "name": "Vách giấy ô gỗ",
    "color": "#ddd2af",
    "tool": "axe",
    "hardness": 1,
    "useNote": "Ô giấy kem trong lưới gỗ, khối đầy không mở được.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 278,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_paper_timber_lattice",
      "c25_paper_timber_lattice",
      "c25_paper_timber_lattice_cap",
      "c25_paper_timber_lattice_cap",
      "c25_paper_timber_lattice",
      "c25_paper_timber_lattice"
    ]
  },
  {
    "id": 279,
    "key": "copper_standing_seam",
    "name": "Đồng mái gờ đứng",
    "color": "#b0774e",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Hai gờ đứng, mép tôn gập và đường đồng sáng.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 279,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam"
    ]
  },
  {
    "id": 280,
    "key": "zinc_diamond_roof",
    "name": "Kẽm mái hình thoi",
    "color": "#8c9ea1",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Tấm kẽm ghép thoi có gờ sáng ở hai cạnh.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 280,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_zinc_diamond_roof",
      "c25_zinc_diamond_roof",
      "c25_zinc_diamond_roof",
      "c25_zinc_diamond_roof",
      "c25_zinc_diamond_roof",
      "c25_zinc_diamond_roof"
    ]
  },
  {
    "id": 281,
    "key": "iron_corrugated_panel",
    "name": "Sắt tấm sóng vuông",
    "color": "#697c81",
    "tool": "pick",
    "hardness": 3.4,
    "useNote": "Sóng vuông rộng xen dải tối, dùng cho mái xưởng.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 281,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel"
    ]
  },
  {
    "id": 282,
    "key": "brass_rivet_plaque",
    "name": "Đồng thau viền đinh",
    "color": "#b7a056",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Tấm thau có viền kép và bốn đinh lớn.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 282,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque"
    ]
  },
  {
    "id": 283,
    "key": "hammered_bronze",
    "name": "Đồng thiếc gõ búa",
    "color": "#947850",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Các vết búa tròn lệch hàng với phản sáng tiết chế.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 283,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze"
    ]
  },
  {
    "id": 284,
    "key": "verdigris_sunken_square",
    "name": "Đồng xanh ô lõm",
    "color": "#568b80",
    "tool": "pick",
    "hardness": 3,
    "useNote": "Ô vuông chìm và bốn góc đồng nâu, không có lỗ xuyên.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 284,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_verdigris_sunken_square",
      "c25_verdigris_sunken_square",
      "c25_verdigris_sunken_square",
      "c25_verdigris_sunken_square",
      "c25_verdigris_sunken_square",
      "c25_verdigris_sunken_square"
    ]
  },
  {
    "id": 285,
    "key": "slate_ridge_course",
    "name": "Ngói phiến hàng gờ",
    "color": "#596779",
    "tool": "pick",
    "hardness": 2.7,
    "useNote": "Mí ngói bản rộng, gờ nối dọc xen kẽ.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 285,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course"
    ]
  },
  {
    "id": 286,
    "key": "bound_straw_thatch",
    "name": "Mái rơm buộc lạt",
    "color": "#bca05a",
    "tool": "axe",
    "hardness": 1,
    "useNote": "Rơm chạy dọc thành bó, hai hàng lạt ngang rõ.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 0,
    "material": 286,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch"
    ]
  },
  {
    "id": 287,
    "key": "terracotta_overlap_tile",
    "name": "Ngói đất chồng mí",
    "color": "#ad684e",
    "tool": "pick",
    "hardness": 2.4,
    "useNote": "Ngói đất bản cong biểu diễn bằng mí và đường gờ.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 287,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_terracotta_overlap_tile",
      "c25_terracotta_overlap_tile",
      "c25_terracotta_overlap_tile",
      "c25_terracotta_overlap_tile",
      "c25_terracotta_overlap_tile",
      "c25_terracotta_overlap_tile"
    ]
  },
  {
    "id": 288,
    "key": "blue_glazed_roof",
    "name": "Ngói men lam mũi tên",
    "color": "#557f9c",
    "tool": "pick",
    "hardness": 2.5,
    "useNote": "Các mũi ngói men lam chồng thành hàng so le.",
    "family": "surface",
    "shape": "cube",
    "solid": true,
    "opaque": true,
    "render": "opaque",
    "minPickTier": 1,
    "material": 288,
    "fixedAxis": "XYZ",
    "faceKeys": [
      "c25_blue_glazed_roof",
      "c25_blue_glazed_roof",
      "c25_blue_glazed_roof",
      "c25_blue_glazed_roof",
      "c25_blue_glazed_roof",
      "c25_blue_glazed_roof"
    ]
  }
];
const forms=[
  {
    "id": 289,
    "key": "sandstone_half_slab",
    "name": "Nửa tấm sa thạch viền",
    "material": 249,
    "form": "slab",
    "useNote": "Lát bậc thấp và bờ sân cao nửa khối.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#c7ac78",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone"
    ]
  },
  {
    "id": 290,
    "key": "granite_fan_slab",
    "name": "Nửa tấm đá lát quạt",
    "material": 250,
    "form": "slab",
    "useNote": "Ghép lối đi thấp, giữ họa tiết nan quạt.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#8a9696",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving"
    ]
  },
  {
    "id": 291,
    "key": "travertine_slab",
    "name": "Nửa tấm travertine",
    "material": 253,
    "form": "slab",
    "useNote": "Bậc thấp với lớp khoáng ngang lộ ở cạnh.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#c7b69a",
    "tool": "pick",
    "hardness": 2.7,
    "minPickTier": 1,
    "faceKeys": [
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine"
    ]
  },
  {
    "id": 292,
    "key": "white_marble_slab",
    "name": "Nửa tấm cẩm thạch trắng",
    "material": 256,
    "form": "slab",
    "useNote": "Mặt bàn hoặc sàn thấp có vân nhánh.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#dddcd0",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble"
    ]
  },
  {
    "id": 293,
    "key": "cobalt_wave_slab",
    "name": "Nửa tấm gốm sóng lam",
    "material": 260,
    "form": "slab",
    "useNote": "Viền hồ và mái hiên thấp bằng gốm.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#3e6f99",
    "tool": "pick",
    "hardness": 2.2,
    "minPickTier": 1,
    "faceKeys": [
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic"
    ]
  },
  {
    "id": 294,
    "key": "basket_brick_slab",
    "name": "Nửa tấm gạch đan rổ",
    "material": 265,
    "form": "slab",
    "useNote": "Đường đi nửa khối với mối đan rõ.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#bb9256",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick"
    ]
  },
  {
    "id": 295,
    "key": "pegged_oak_slab",
    "name": "Nửa tấm sồi ghép chốt",
    "material": 269,
    "form": "slab",
    "useNote": "Sàn gỗ thấp hoặc mái hiên mỏng.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#a58150",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel"
    ]
  },
  {
    "id": 296,
    "key": "birch_joinery_slab",
    "name": "Nửa tấm bạch dương mộng",
    "material": 273,
    "form": "slab",
    "useNote": "Sàn sáng giữ các khung mộng vuông.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#c7b788",
    "tool": "axe",
    "hardness": 1.4,
    "minPickTier": 0,
    "faceKeys": [
      "c25_birch_square_joinery",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery"
    ]
  },
  {
    "id": 297,
    "key": "copper_seam_slab",
    "name": "Nửa tấm đồng gờ",
    "material": 279,
    "form": "slab",
    "useNote": "Bậc xưởng và mép mái đồng nửa khối.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#b0774e",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam"
    ]
  },
  {
    "id": 298,
    "key": "straw_thatch_slab",
    "name": "Nửa tấm mái rơm",
    "material": 286,
    "form": "slab",
    "useNote": "Mái rơm mỏng cho nhà vườn.",
    "family": "slab",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ]
    ],
    "color": "#bca05a",
    "tool": "axe",
    "hardness": 1,
    "minPickTier": 0,
    "faceKeys": [
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch"
    ]
  },
  {
    "id": 299,
    "key": "sandstone_stair",
    "name": "Bậc sa thạch chạm viền",
    "material": 249,
    "form": "stair",
    "useNote": "Bậc thấp ở +Z, cao ở −Z; hướng đặt cố định.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#c7ac78",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone"
    ]
  },
  {
    "id": 300,
    "key": "granite_fan_stair",
    "name": "Bậc đá hoa cương lát quạt",
    "material": 250,
    "form": "stair",
    "useNote": "Bậc sân quạt, phía cao cố định −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#8a9696",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving"
    ]
  },
  {
    "id": 301,
    "key": "travertine_stair",
    "name": "Bậc travertine sọc",
    "material": 253,
    "form": "stair",
    "useNote": "Mặt bậc đá kem phân tầng, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#c7b69a",
    "tool": "pick",
    "hardness": 2.7,
    "minPickTier": 1,
    "faceKeys": [
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine",
      "c25_ribbed_travertine"
    ]
  },
  {
    "id": 302,
    "key": "white_marble_stair",
    "name": "Bậc cẩm thạch vân nhánh",
    "material": 256,
    "form": "stair",
    "useNote": "Cầu thang sảnh trắng, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#dddcd0",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble"
    ]
  },
  {
    "id": 303,
    "key": "cobalt_wave_stair",
    "name": "Bậc gốm sóng lam",
    "material": 260,
    "form": "stair",
    "useNote": "Bậc gốm xanh hoặc mái bậc, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#3e6f99",
    "tool": "pick",
    "hardness": 2.2,
    "minPickTier": 1,
    "faceKeys": [
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic",
      "c25_cobalt_wave_ceramic"
    ]
  },
  {
    "id": 304,
    "key": "basket_brick_stair",
    "name": "Bậc gạch vàng đan rổ",
    "material": 265,
    "form": "stair",
    "useNote": "Bậc ngoài sân vàng ấm, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#bb9256",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick",
      "c25_ochre_basket_brick"
    ]
  },
  {
    "id": 305,
    "key": "pegged_oak_stair",
    "name": "Bậc sồi ghép chốt",
    "material": 269,
    "form": "stair",
    "useNote": "Bậc hiên gỗ, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#a58150",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel"
    ]
  },
  {
    "id": 306,
    "key": "birch_joinery_stair",
    "name": "Bậc bạch dương mộng vuông",
    "material": 273,
    "form": "stair",
    "useNote": "Bậc gỗ sáng, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#c7b788",
    "tool": "axe",
    "hardness": 1.4,
    "minPickTier": 0,
    "faceKeys": [
      "c25_birch_square_joinery",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery"
    ]
  },
  {
    "id": 307,
    "key": "copper_seam_stair",
    "name": "Bậc đồng mái gờ",
    "material": 279,
    "form": "stair",
    "useNote": "Bậc xưởng hoặc mái đồng, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#b0774e",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam"
    ]
  },
  {
    "id": 308,
    "key": "straw_thatch_stair",
    "name": "Bậc mái rơm buộc lạt",
    "material": 286,
    "form": "stair",
    "useNote": "Ghép mái rơm bậc, cao ở −Z.",
    "family": "stair",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "high:-Z",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        8,
        16
      ],
      [
        0,
        8,
        0,
        16,
        16,
        8
      ]
    ],
    "color": "#bca05a",
    "tool": "axe",
    "hardness": 1,
    "minPickTier": 0,
    "faceKeys": [
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch"
    ]
  },
  {
    "id": 309,
    "key": "limestone_cross_column",
    "name": "Cột đá vôi cạnh vát",
    "material": 251,
    "form": "column_cross",
    "useNote": "Chân và đầu vuông, thân vát bốn cạnh bằng các hộp.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        5,
        3,
        3,
        11,
        13,
        13
      ],
      [
        3,
        3,
        5,
        5,
        13,
        11
      ],
      [
        11,
        3,
        5,
        13,
        13,
        11
      ],
      [
        0,
        13,
        0,
        16,
        16,
        16
      ]
    ],
    "color": "#c9c9af",
    "tool": "pick",
    "hardness": 2.6,
    "minPickTier": 1,
    "faceKeys": [
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse",
      "c25_limestone_longcourse"
    ]
  },
  {
    "id": 310,
    "key": "basalt_tier_column",
    "name": "Cột bazan đai tầng",
    "material": 252,
    "form": "column_tiers",
    "useNote": "Thân tối, hai đai rộng tạo nhịp cho cổng.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        5,
        3,
        5,
        11,
        7,
        11
      ],
      [
        2,
        7,
        2,
        14,
        9,
        14
      ],
      [
        5,
        9,
        5,
        11,
        13,
        11
      ],
      [
        1,
        13,
        1,
        15,
        16,
        15
      ]
    ],
    "color": "#4d5759",
    "tool": "pick",
    "hardness": 3.2,
    "minPickTier": 1,
    "faceKeys": [
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay",
      "c25_basalt_octagon_inlay"
    ]
  },
  {
    "id": 311,
    "key": "sandstone_taper_column",
    "name": "Cột sa thạch thu tầng",
    "material": 249,
    "form": "column_taper",
    "useNote": "Ba tầng thân thu nhỏ dần, đỡ mái và hiên.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        2,
        3,
        2,
        14,
        6,
        14
      ],
      [
        3,
        6,
        3,
        13,
        10,
        13
      ],
      [
        4,
        10,
        4,
        12,
        13,
        12
      ],
      [
        2,
        13,
        2,
        14,
        16,
        14
      ]
    ],
    "color": "#c7ac78",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone"
    ]
  },
  {
    "id": 312,
    "key": "marble_wall_pilaster",
    "name": "Trụ ốp cẩm thạch",
    "material": 256,
    "form": "pilaster",
    "useNote": "Trụ nông áp cạnh −Z, có chân và đầu nhô.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        7
      ],
      [
        3,
        3,
        0,
        13,
        13,
        4
      ],
      [
        0,
        13,
        0,
        16,
        16,
        7
      ]
    ],
    "color": "#dddcd0",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble"
    ]
  },
  {
    "id": 313,
    "key": "oak_footed_post",
    "name": "Trụ sồi chân mộng",
    "material": 269,
    "form": "post",
    "useNote": "Cột gỗ có đế và đầu bản rộng.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        1,
        0,
        1,
        15,
        3,
        15
      ],
      [
        4,
        3,
        4,
        12,
        13,
        12
      ],
      [
        0,
        13,
        0,
        16,
        16,
        16
      ]
    ],
    "color": "#a58150",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel"
    ]
  },
  {
    "id": 314,
    "key": "bamboo_bundled_column",
    "name": "Cột tre bó bốn thanh",
    "material": 270,
    "form": "bundle",
    "useNote": "Bốn thanh tre vuông và hai đai buộc, có khe thật.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        1,
        0,
        1,
        15,
        3,
        15
      ],
      [
        2,
        3,
        2,
        6,
        13,
        6
      ],
      [
        10,
        3,
        2,
        14,
        13,
        6
      ],
      [
        2,
        3,
        10,
        6,
        13,
        14
      ],
      [
        10,
        3,
        10,
        14,
        13,
        14
      ],
      [
        1,
        13,
        1,
        15,
        16,
        15
      ]
    ],
    "color": "#c2b16d",
    "tool": "axe",
    "hardness": 1.2,
    "minPickTier": 0,
    "faceKeys": [
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave"
    ]
  },
  {
    "id": 315,
    "key": "bronze_socket_post",
    "name": "Trụ đồng thiếc chân đế",
    "material": 283,
    "form": "column_socket",
    "useNote": "Thân hẹp trong hai đế vuông nổi.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        4,
        16
      ],
      [
        5,
        4,
        5,
        11,
        12,
        11
      ],
      [
        1,
        12,
        1,
        15,
        16,
        15
      ]
    ],
    "color": "#947850",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze",
      "c25_hammered_bronze"
    ]
  },
  {
    "id": 316,
    "key": "jade_stepped_column",
    "name": "Cột gốm ngọc ba đai",
    "material": 263,
    "form": "column_bands",
    "useNote": "Ba đai men xanh cách nhau bằng thân nhỏ.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        1,
        0,
        1,
        15,
        2,
        15
      ],
      [
        5,
        2,
        5,
        11,
        6,
        11
      ],
      [
        2,
        6,
        2,
        14,
        8,
        14
      ],
      [
        5,
        8,
        5,
        11,
        12,
        11
      ],
      [
        1,
        12,
        1,
        15,
        14,
        15
      ],
      [
        4,
        14,
        4,
        12,
        16,
        12
      ]
    ],
    "color": "#688b69",
    "tool": "pick",
    "hardness": 2.3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile"
    ]
  },
  {
    "id": 317,
    "key": "charred_twin_post",
    "name": "Trụ đôi gỗ hun",
    "material": 276,
    "form": "twin_post",
    "useNote": "Hai trụ song song nối bởi đầu và chân.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        3,
        16,
        3,
        13
      ],
      [
        1,
        3,
        5,
        5,
        13,
        11
      ],
      [
        11,
        3,
        5,
        15,
        13,
        11
      ],
      [
        0,
        13,
        3,
        16,
        16,
        13
      ]
    ],
    "color": "#4c4c44",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_charred_parallel_wood",
      "c25_charred_parallel_wood",
      "c25_charred_parallel_wood_cap",
      "c25_charred_parallel_wood_cap",
      "c25_charred_parallel_wood",
      "c25_charred_parallel_wood"
    ]
  },
  {
    "id": 318,
    "key": "brass_capped_pedestal",
    "name": "Cột bục đầu thau",
    "material": 282,
    "form": "pedestal",
    "useNote": "Bục vuông có thân thắt và mặt trưng bày rộng.",
    "family": "column",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        4,
        3,
        4,
        12,
        12,
        12
      ],
      [
        1,
        12,
        1,
        15,
        16,
        15
      ]
    ],
    "color": "#b7a056",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque"
    ]
  },
  {
    "id": 319,
    "key": "oak_two_rail",
    "name": "Lan can sồi hai thanh",
    "material": 269,
    "form": "rail",
    "useNote": "Hai cột và hai thanh ngang dọc X, không tự nối.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        3,
        16,
        10
      ],
      [
        13,
        0,
        6,
        16,
        16,
        10
      ],
      [
        3,
        5,
        7,
        13,
        7,
        9
      ],
      [
        3,
        12,
        7,
        13,
        14,
        9
      ]
    ],
    "color": "#a58150",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel"
    ]
  },
  {
    "id": 320,
    "key": "bamboo_three_rail",
    "name": "Lan can tre ba thanh",
    "material": 270,
    "form": "rail_three",
    "useNote": "Ba thanh ngang cùng hai cột tre, trục X cố định.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        3,
        16,
        10
      ],
      [
        13,
        0,
        6,
        16,
        16,
        10
      ],
      [
        3,
        3,
        7,
        13,
        5,
        9
      ],
      [
        3,
        8,
        7,
        13,
        10,
        9
      ],
      [
        3,
        13,
        7,
        13,
        15,
        9
      ]
    ],
    "color": "#c2b16d",
    "tool": "axe",
    "hardness": 1.2,
    "minPickTier": 0,
    "faceKeys": [
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave"
    ]
  },
  {
    "id": 321,
    "key": "iron_bar_screen",
    "name": "Song sắt bốn thanh",
    "material": 281,
    "form": "bars",
    "useNote": "Bốn song đứng trong khung, có khoảng trống thật.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        16,
        2,
        10
      ],
      [
        0,
        14,
        6,
        16,
        16,
        10
      ],
      [
        0,
        2,
        6,
        2,
        14,
        10
      ],
      [
        5,
        2,
        6,
        7,
        14,
        10
      ],
      [
        9,
        2,
        6,
        11,
        14,
        10
      ],
      [
        14,
        2,
        6,
        16,
        14,
        10
      ]
    ],
    "color": "#697c81",
    "tool": "pick",
    "hardness": 3.4,
    "minPickTier": 1,
    "faceKeys": [
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel",
      "c25_iron_corrugated_panel"
    ]
  },
  {
    "id": 322,
    "key": "cedar_window_frame",
    "name": "Khung cửa sổ gỗ tuyết tùng",
    "material": 272,
    "form": "window",
    "useNote": "Khung chữ nhật rỗng giữa, cố định mặt XY.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        16,
        2,
        10
      ],
      [
        0,
        14,
        6,
        16,
        16,
        10
      ],
      [
        0,
        2,
        6,
        2,
        14,
        10
      ],
      [
        14,
        2,
        6,
        16,
        14,
        10
      ]
    ],
    "color": "#a77659",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame"
    ]
  },
  {
    "id": 323,
    "key": "birch_cross_window",
    "name": "Khung cửa chữ thập bạch dương",
    "material": 273,
    "form": "window_cross",
    "useNote": "Khung chia bốn ô bằng hai thanh giữa.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        16,
        2,
        10
      ],
      [
        0,
        14,
        6,
        16,
        16,
        10
      ],
      [
        0,
        2,
        6,
        2,
        14,
        10
      ],
      [
        14,
        2,
        6,
        16,
        14,
        10
      ],
      [
        7,
        2,
        6,
        9,
        14,
        10
      ],
      [
        2,
        7,
        6,
        7,
        9,
        10
      ],
      [
        9,
        7,
        6,
        14,
        9,
        10
      ]
    ],
    "color": "#c7b788",
    "tool": "axe",
    "hardness": 1.4,
    "minPickTier": 0,
    "faceKeys": [
      "c25_birch_square_joinery",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery"
    ]
  },
  {
    "id": 324,
    "key": "rattan_horizontal_screen",
    "name": "Bình phong mây nan ngang",
    "material": 275,
    "form": "screen_slats",
    "useNote": "Năm nan ngang và hai biên đứng, không mở/đóng.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        2,
        16,
        10
      ],
      [
        14,
        0,
        6,
        16,
        16,
        10
      ],
      [
        2,
        0,
        7,
        14,
        2,
        9
      ],
      [
        2,
        3,
        7,
        14,
        5,
        9
      ],
      [
        2,
        6,
        7,
        14,
        8,
        9
      ],
      [
        2,
        9,
        7,
        14,
        11,
        9
      ],
      [
        2,
        12,
        7,
        14,
        14,
        9
      ]
    ],
    "color": "#bba06a",
    "tool": "axe",
    "hardness": 1,
    "minPickTier": 0,
    "faceKeys": [
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave_cap",
      "c25_rattan_hex_weave_cap",
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave"
    ]
  },
  {
    "id": 325,
    "key": "copper_low_balustrade",
    "name": "Lan can đồng gờ thấp",
    "material": 279,
    "form": "balustrade",
    "useNote": "Bốn trụ ngắn đỡ tay vịn, trục X.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        3,
        12,
        10
      ],
      [
        4,
        0,
        6,
        7,
        12,
        10
      ],
      [
        9,
        0,
        6,
        12,
        12,
        10
      ],
      [
        13,
        0,
        6,
        16,
        12,
        10
      ],
      [
        0,
        12,
        5,
        16,
        15,
        11
      ]
    ],
    "color": "#b0774e",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam"
    ]
  },
  {
    "id": 326,
    "key": "slate_capped_wall",
    "name": "Tường thấp nắp phiến",
    "material": 285,
    "form": "low_wall",
    "useNote": "Thân tường hẹp và nắp rộng cao một khối.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        2,
        0,
        5,
        14,
        12,
        11
      ],
      [
        0,
        12,
        3,
        16,
        16,
        13
      ]
    ],
    "color": "#596779",
    "tool": "pick",
    "hardness": 2.7,
    "minPickTier": 1,
    "faceKeys": [
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course"
    ]
  },
  {
    "id": 327,
    "key": "sandstone_gate_arch",
    "name": "Vòm cổng sa thạch bậc",
    "material": 249,
    "form": "arch",
    "useNote": "Hai chân và vòm bậc có khoảng rỗng giữa.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        5,
        3,
        11,
        11
      ],
      [
        13,
        0,
        5,
        16,
        11,
        11
      ],
      [
        0,
        11,
        5,
        5,
        13,
        11
      ],
      [
        11,
        11,
        5,
        16,
        13,
        11
      ],
      [
        0,
        13,
        5,
        16,
        16,
        11
      ]
    ],
    "color": "#c7ac78",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone"
    ]
  },
  {
    "id": 328,
    "key": "paper_timber_transom",
    "name": "Ô thoáng khung giấy",
    "material": 278,
    "form": "transom",
    "useNote": "Khung dày với ba ô hở, dùng phía trên cửa.",
    "family": "screen",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        6,
        16,
        3,
        10
      ],
      [
        0,
        13,
        6,
        16,
        16,
        10
      ],
      [
        0,
        3,
        6,
        2,
        13,
        10
      ],
      [
        14,
        3,
        6,
        16,
        13,
        10
      ],
      [
        5,
        3,
        6,
        7,
        13,
        10
      ],
      [
        9,
        3,
        6,
        11,
        13,
        10
      ]
    ],
    "color": "#ddd2af",
    "tool": "axe",
    "hardness": 1,
    "minPickTier": 0,
    "faceKeys": [
      "c25_paper_timber_lattice",
      "c25_paper_timber_lattice",
      "c25_paper_timber_lattice_cap",
      "c25_paper_timber_lattice_cap",
      "c25_paper_timber_lattice",
      "c25_paper_timber_lattice"
    ]
  },
  {
    "id": 329,
    "key": "oak_four_leg_table",
    "name": "Bàn sồi bốn chân trang trí",
    "material": 269,
    "form": "table",
    "useNote": "Mặt bàn cao, bốn chân; không phải bàn chế tạo.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        12,
        0,
        16,
        15,
        16
      ],
      [
        1,
        0,
        1,
        4,
        12,
        4
      ],
      [
        12,
        0,
        1,
        15,
        12,
        4
      ],
      [
        1,
        0,
        12,
        4,
        12,
        15
      ],
      [
        12,
        0,
        12,
        15,
        12,
        15
      ]
    ],
    "color": "#a58150",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel_cap",
      "c25_pegged_oak_panel",
      "c25_pegged_oak_panel"
    ]
  },
  {
    "id": 330,
    "key": "marble_console_table",
    "name": "Bàn đá hai trụ trang trí",
    "material": 256,
    "form": "console",
    "useNote": "Mặt cẩm thạch trên hai trụ bên, không chứa đồ.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        12,
        1,
        16,
        16,
        15
      ],
      [
        1,
        0,
        3,
        4,
        12,
        13
      ],
      [
        12,
        0,
        3,
        15,
        12,
        13
      ]
    ],
    "color": "#dddcd0",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble"
    ]
  },
  {
    "id": 331,
    "key": "walnut_bench",
    "name": "Ghế băng óc chó trang trí",
    "material": 271,
    "form": "bench",
    "useNote": "Mặt ghế và hai chân tấm; không có thao tác ngồi.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        7,
        2,
        16,
        10,
        14
      ],
      [
        1,
        0,
        3,
        4,
        7,
        13
      ],
      [
        12,
        0,
        3,
        15,
        7,
        13
      ]
    ],
    "color": "#775840",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_walnut_herringbone",
      "c25_walnut_herringbone",
      "c25_walnut_herringbone_cap",
      "c25_walnut_herringbone_cap",
      "c25_walnut_herringbone",
      "c25_walnut_herringbone"
    ]
  },
  {
    "id": 332,
    "key": "birch_back_chair",
    "name": "Ghế tựa bạch dương trang trí",
    "material": 273,
    "form": "chair",
    "useNote": "Bốn chân, mặt ghế và lưng ở −Z; không ngồi được.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        1,
        7,
        2,
        15,
        10,
        15
      ],
      [
        1,
        0,
        2,
        4,
        7,
        5
      ],
      [
        12,
        0,
        2,
        15,
        7,
        5
      ],
      [
        1,
        0,
        12,
        4,
        7,
        15
      ],
      [
        12,
        0,
        12,
        15,
        7,
        15
      ],
      [
        1,
        10,
        2,
        4,
        16,
        5
      ],
      [
        12,
        10,
        2,
        15,
        16,
        5
      ],
      [
        4,
        12,
        2,
        12,
        16,
        5
      ]
    ],
    "color": "#c7b788",
    "tool": "axe",
    "hardness": 1.4,
    "minPickTier": 0,
    "faceKeys": [
      "c25_birch_square_joinery",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery_cap",
      "c25_birch_square_joinery",
      "c25_birch_square_joinery"
    ]
  },
  {
    "id": 333,
    "key": "bamboo_low_stool",
    "name": "Đôn tre thấp trang trí",
    "material": 270,
    "form": "stool",
    "useNote": "Mặt đôn thấp trên bốn chân có khoảng trống.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        1,
        6,
        1,
        15,
        9,
        15
      ],
      [
        2,
        0,
        2,
        5,
        6,
        5
      ],
      [
        11,
        0,
        2,
        14,
        6,
        5
      ],
      [
        2,
        0,
        11,
        5,
        6,
        14
      ],
      [
        11,
        0,
        11,
        14,
        6,
        14
      ]
    ],
    "color": "#c2b16d",
    "tool": "axe",
    "hardness": 1.2,
    "minPickTier": 0,
    "faceKeys": [
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave_cap",
      "c25_bamboo_zigzag_weave",
      "c25_bamboo_zigzag_weave"
    ]
  },
  {
    "id": 334,
    "key": "cedar_open_shelf",
    "name": "Kệ tuyết tùng ba tầng",
    "material": 272,
    "form": "shelf",
    "useNote": "Ba mặt kệ và hai thành; chỉ để xây trang trí.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        2,
        2,
        16,
        14
      ],
      [
        14,
        0,
        2,
        16,
        16,
        14
      ],
      [
        2,
        0,
        2,
        14,
        2,
        14
      ],
      [
        2,
        7,
        2,
        14,
        9,
        14
      ],
      [
        2,
        14,
        2,
        14,
        16,
        14
      ]
    ],
    "color": "#a77659",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame"
    ]
  },
  {
    "id": 335,
    "key": "copper_work_trestle",
    "name": "Giá kê đồng hai chân",
    "material": 279,
    "form": "trestle",
    "useNote": "Hai chân tấm và thanh mặt hẹp cho xưởng.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        12,
        5,
        16,
        15,
        11
      ],
      [
        1,
        0,
        3,
        4,
        12,
        13
      ],
      [
        12,
        0,
        3,
        15,
        12,
        13
      ]
    ],
    "color": "#b0774e",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam"
    ]
  },
  {
    "id": 336,
    "key": "rattan_cushion_seat",
    "name": "Ghế mây mặt dày trang trí",
    "material": 275,
    "form": "seat",
    "useNote": "Mặt đan dày với chân thấp, không có nội dung chứa.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        5,
        0,
        16,
        10,
        16
      ],
      [
        1,
        0,
        1,
        4,
        5,
        4
      ],
      [
        12,
        0,
        1,
        15,
        5,
        4
      ],
      [
        1,
        0,
        12,
        4,
        5,
        15
      ],
      [
        12,
        0,
        12,
        15,
        5,
        15
      ]
    ],
    "color": "#bba06a",
    "tool": "axe",
    "hardness": 1,
    "minPickTier": 0,
    "faceKeys": [
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave_cap",
      "c25_rattan_hex_weave_cap",
      "c25_rattan_hex_weave",
      "c25_rattan_hex_weave"
    ]
  },
  {
    "id": 337,
    "key": "shipwood_market_counter",
    "name": "Quầy ván thuyền trang trí",
    "material": 277,
    "form": "counter",
    "useNote": "Mặt quầy rộng, vách trước và chân sau.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        13,
        0,
        16,
        16,
        16
      ],
      [
        0,
        0,
        2,
        16,
        13,
        5
      ],
      [
        1,
        0,
        12,
        4,
        13,
        15
      ],
      [
        12,
        0,
        12,
        15,
        13,
        15
      ]
    ],
    "color": "#849185",
    "tool": "axe",
    "hardness": 1.5,
    "minPickTier": 0,
    "faceKeys": [
      "c25_shipwood_nailboard",
      "c25_shipwood_nailboard",
      "c25_shipwood_nailboard_cap",
      "c25_shipwood_nailboard_cap",
      "c25_shipwood_nailboard",
      "c25_shipwood_nailboard"
    ]
  },
  {
    "id": 338,
    "key": "brass_display_stand",
    "name": "Giá trưng bày viền thau",
    "material": 282,
    "form": "display",
    "useNote": "Bục ba tầng cho vật trang trí do người chơi đặt.",
    "family": "furniture",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        4,
        3,
        4,
        12,
        11,
        12
      ],
      [
        1,
        11,
        1,
        15,
        14,
        15
      ]
    ],
    "color": "#b7a056",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque"
    ]
  },
  {
    "id": 339,
    "key": "terracotta_square_planter",
    "name": "Bồn gốm vuông rỗng",
    "material": 261,
    "form": "planter",
    "useNote": "Bốn thành và đáy có lòng rỗng; không tự trồng cây.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        0,
        3,
        0,
        3,
        12,
        16
      ],
      [
        13,
        3,
        0,
        16,
        12,
        16
      ],
      [
        3,
        3,
        0,
        13,
        12,
        3
      ],
      [
        3,
        3,
        13,
        13,
        12,
        16
      ]
    ],
    "color": "#b7754a",
    "tool": "pick",
    "hardness": 2.2,
    "minPickTier": 1,
    "faceKeys": [
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk",
      "c25_terracotta_sun_disk"
    ]
  },
  {
    "id": 340,
    "key": "jade_long_trough",
    "name": "Máng gốm ngọc rỗng",
    "material": 263,
    "form": "trough",
    "useNote": "Máng thấp dọc X, chỉ là hình khối trang trí.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        3,
        16,
        2,
        13
      ],
      [
        0,
        2,
        3,
        2,
        7,
        13
      ],
      [
        14,
        2,
        3,
        16,
        7,
        13
      ],
      [
        2,
        2,
        3,
        14,
        7,
        5
      ],
      [
        2,
        2,
        11,
        14,
        7,
        13
      ]
    ],
    "color": "#688b69",
    "tool": "pick",
    "hardness": 2.3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile",
      "c25_jade_bamboo_tile"
    ]
  },
  {
    "id": 341,
    "key": "sandstone_corbel",
    "name": "Con sơn sa thạch bậc",
    "material": 249,
    "form": "corbel",
    "useNote": "Giá đỡ thu bậc bám phía −Z, đặt dưới mái.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        4,
        4
      ],
      [
        0,
        4,
        0,
        16,
        8,
        8
      ],
      [
        0,
        8,
        0,
        16,
        12,
        12
      ],
      [
        0,
        12,
        0,
        16,
        16,
        16
      ]
    ],
    "color": "#c7ac78",
    "tool": "pick",
    "hardness": 2.5,
    "minPickTier": 1,
    "faceKeys": [
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone",
      "c25_rusticated_sandstone"
    ]
  },
  {
    "id": 342,
    "key": "slate_chimney_ring",
    "name": "Vành ống khói phiến",
    "material": 285,
    "form": "chimney",
    "useNote": "Bốn vách dày và lỗ giữa thật; không sinh khói.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        3,
        16,
        16
      ],
      [
        13,
        0,
        0,
        16,
        16,
        16
      ],
      [
        3,
        0,
        0,
        13,
        16,
        3
      ],
      [
        3,
        0,
        13,
        13,
        16,
        16
      ]
    ],
    "color": "#596779",
    "tool": "pick",
    "hardness": 2.7,
    "minPickTier": 1,
    "faceKeys": [
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course",
      "c25_slate_ridge_course"
    ]
  },
  {
    "id": 343,
    "key": "brass_finial",
    "name": "Chóp thau phân tầng",
    "material": 282,
    "form": "finial",
    "useNote": "Bốn tầng vuông thu nhỏ làm đỉnh cổng.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        3,
        3,
        3,
        13,
        7,
        13
      ],
      [
        5,
        7,
        5,
        11,
        12,
        11
      ],
      [
        7,
        12,
        7,
        9,
        16,
        9
      ]
    ],
    "color": "#b7a056",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque",
      "c25_brass_rivet_plaque"
    ]
  },
  {
    "id": 344,
    "key": "marble_plinth",
    "name": "Bệ cẩm thạch ba tầng",
    "material": 256,
    "form": "plinth",
    "useNote": "Bệ thấp rộng, thân thu và mặt trên vuông.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        16
      ],
      [
        3,
        3,
        3,
        13,
        7,
        13
      ],
      [
        1,
        7,
        1,
        15,
        10,
        15
      ]
    ],
    "color": "#dddcd0",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble",
      "c25_branch_white_marble"
    ]
  },
  {
    "id": 345,
    "key": "copper_vent_grille",
    "name": "Cửa gió đồng nan thẳng",
    "material": 279,
    "form": "vent",
    "useNote": "Khung thấp và năm nan dọc có khe thật.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        3,
        2
      ],
      [
        0,
        0,
        14,
        16,
        3,
        16
      ],
      [
        0,
        0,
        2,
        2,
        3,
        14
      ],
      [
        14,
        0,
        2,
        16,
        3,
        14
      ],
      [
        3,
        0,
        2,
        4,
        3,
        14
      ],
      [
        5,
        0,
        2,
        6,
        3,
        14
      ],
      [
        7,
        0,
        2,
        8,
        3,
        14
      ],
      [
        9,
        0,
        2,
        10,
        3,
        14
      ],
      [
        11,
        0,
        2,
        12,
        3,
        14
      ]
    ],
    "color": "#b0774e",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam",
      "c25_copper_standing_seam"
    ]
  },
  {
    "id": 346,
    "key": "straw_awning",
    "name": "Mái hiên rơm giật cấp",
    "material": 286,
    "form": "awning",
    "useNote": "Ba bản mái giật cao về −Z, không có vải động.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        13,
        0,
        16,
        16,
        5
      ],
      [
        0,
        10,
        5,
        16,
        13,
        10
      ],
      [
        0,
        7,
        10,
        16,
        10,
        16
      ]
    ],
    "color": "#bca05a",
    "tool": "axe",
    "hardness": 1,
    "minPickTier": 0,
    "faceKeys": [
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch",
      "c25_bound_straw_thatch"
    ]
  },
  {
    "id": 347,
    "key": "granite_stepping_cluster",
    "name": "Cụm đá bước ba viên",
    "material": 250,
    "form": "stepping",
    "useNote": "Ba viên vuông thấp tách nhau, khe va chạm khớp hình.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        1,
        5,
        3,
        7
      ],
      [
        7,
        0,
        0,
        13,
        4,
        6
      ],
      [
        5,
        0,
        9,
        12,
        2,
        16
      ]
    ],
    "color": "#8a9696",
    "tool": "pick",
    "hardness": 3,
    "minPickTier": 1,
    "faceKeys": [
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving",
      "c25_granite_fan_paving"
    ]
  },
  {
    "id": 348,
    "key": "cedar_crate_frame",
    "name": "Khung kiện gỗ thoáng",
    "material": 272,
    "form": "crate_frame",
    "useNote": "Khung cạnh hở có đáy, không phải rương chứa đồ.",
    "family": "detail",
    "shape": "boxes",
    "solid": true,
    "opaque": false,
    "render": "opaque",
    "fixedAxis": "fixed",
    "boxes": [
      [
        0,
        0,
        0,
        16,
        2,
        16
      ],
      [
        0,
        2,
        0,
        2,
        14,
        2
      ],
      [
        14,
        2,
        0,
        16,
        14,
        2
      ],
      [
        0,
        2,
        14,
        2,
        14,
        16
      ],
      [
        14,
        2,
        14,
        16,
        14,
        16
      ],
      [
        0,
        14,
        0,
        16,
        16,
        2
      ],
      [
        0,
        14,
        14,
        16,
        16,
        16
      ],
      [
        0,
        14,
        2,
        2,
        16,
        14
      ],
      [
        14,
        14,
        2,
        16,
        16,
        14
      ]
    ],
    "color": "#a77659",
    "tool": "axe",
    "hardness": 1.6,
    "minPickTier": 0,
    "faceKeys": [
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame_cap",
      "c25_cedar_diagonal_frame",
      "c25_cedar_diagonal_frame"
    ]
  }
];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const tone=(c,n)=>c.map(v=>Math.max(0,Math.min(255,Math.round(v+n))));

  function nativeTile(key){
    const cap=key.endsWith('_cap'),baseKey=cap?key.slice(0,-4):key,def=surfaces.find(d=>'c25_'+d.key===baseKey);
    if(!def)throw new RangeError('Unknown C25 authored tile: '+key);
    const data=new Uint8ClampedArray(24*24*4),base=rgb(def.color),ink=tone(base,-43),dark=tone(base,-69),light=tone(base,31),pale=tone(base,58),cream=rgb('#e6d6af');
    const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=24||y>=24)return;const p=(x+y*24)*4;data[p]=c[0];data[p+1]=c[1];data[p+2]=c[2];data[p+3]=255;};
    const rect=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,c);};
    const line=(x0,y0,x1,y1,c,w=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let j=0;j<=Math.max(1,n);j++)rect(Math.round(x0+(x1-x0)*j/Math.max(1,n)),Math.round(y0+(y1-y0)*j/Math.max(1,n)),w,w,c);};
    const ring=(cx,cy,r,c,width=1)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){const d=Math.hypot(x-cx,y-cy);if(d<=r&&d>r-width)put(x,y,c);}};
    const disk=(cx,cy,rx,ry,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c);};
    const poly=(points,c)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)put(x,y,c);}};
    const frame=(n,c)=>{line(n,n,23-n,n,c);line(n,23-n,23-n,23-n,c);line(n,n,n,23-n,c);line(23-n,n,23-n,23-n,c);};
    // Each named motif below is composed directly on a 24 by 24 integer pixel grid.
    // Fine grain is subordinate to authored joins, figures and material highlights.
    for(let y=0;y<24;y++)for(let x=0;x<24;x++)put(x,y,tone(base,((x*7+y*11+def.id)%9===0)?2:((x*13+y*3+def.id)%11===0)?-2:0));
    if(cap){
      switch(def.id){
      case 269: frame(1,ink);frame(3,light);frame(6,ink);frame(9,light);rect(10,10,4,4,dark);break;
      case 270: for(let x=0;x<24;x+=4){rect(x,0,2,24,light);line(x+2,0,x+2,23,ink);}line(0,5,23,5,ink);line(0,17,23,17,ink);break;
      case 271: for(const r of[10,7,4])ring(10,12,r,ink);line(11,13,21,22,light);frame(0,dark);break;
      case 272: frame(1,dark);for(let n=4;n<=10;n+=3)frame(n,n%2?light:ink);line(3,3,20,20,ink);break;
      case 273: for(const n of[1,4,7,10])frame(n,n%2?ink:light);rect(10,10,4,4,pale);break;
      case 274: for(const r of[11,8,5,2])ring(12,10,r,ink);line(12,10,4,21,light);line(12,10,19,20,dark);break;
      case 275: for(let y=0;y<24;y+=4)for(let x=0;x<24;x+=4){rect(x,y,3,1,light);rect(x+1,y+1,1,3,ink);}frame(0,dark);break;
      case 276: frame(1,ink);for(const r of[9,6,3])ring(11,12,r,light);line(11,12,2,3,dark);line(11,12,22,19,dark);break;
      case 277: for(let y=2;y<24;y+=5){line(0,y,23,y,ink);line(0,y+1,23,y+1,light);}for(const[x,y]of[[3,3],[20,8],[3,13],[20,18]])rect(x,y,2,2,dark);break;
      case 278: rect(0,0,24,24,cream);for(let i=0;i<24;i+=6){line(i,0,i,23,ink);line(0,i,23,i,ink);}frame(0,dark);break;
      default:throw Error('Unwritten C25 cap motif');
      }
      return data;
    }
    switch(def.id){
    case 249:
      for(let y=0;y<24;y+=8){line(0,y,23,y,dark);line(0,y+1,23,y+1,light);for(let x=(y/8%2)*8;x<24;x+=16){line(x,y,x,y+7,ink);line(x+1,y+2,x+1,y+6,pale);}}break;
    case 250:
      rect(0,0,24,24,ink);for(const[cx,cy]of[[0,24],[24,24],[12,6]]){for(const r of[5,10,15,20])ring(cx,cy,r,light,3);for(const a of[-2.8,-2.2,-1.6,-1,-.4])line(cx,cy,cx+22*Math.cos(a),cy+22*Math.sin(a),ink);}break;
    case 251:
      for(let y=0;y<24;y+=6){line(0,y,23,y,ink);line(0,y+1,23,y+1,light);for(const x of y%12===0?[3,18]:[10,22])line(x,y,x,y+5,ink);}break;
    case 252:
      rect(0,0,24,24,dark);poly([[6,1],[17,1],[22,6],[22,17],[17,22],[6,22],[1,17],[1,6]],cream);poly([[7,3],[16,3],[20,7],[20,16],[16,20],[7,20],[3,16],[3,7]],base);for(const[x,y]of[[1,1],[21,1],[1,21],[21,21]])rect(x,y,2,2,rgb('#b49a58'));break;
    case 253:
      for(const[y,h,c]of[[2,2,light],[7,1,ink],[11,3,light],[18,2,ink],[22,1,pale]])rect(0,y,24,h,c);for(const[x,y,w]of[[3,5,4],[14,9,5],[7,16,3],[17,21,4]])rect(x,y,w,1,dark);break;
    case 254:
      for(let y=-12;y<24;y+=8){poly([[0,y],[12,y+7],[12,y+11],[0,y+4]],light);poly([[12,y+7],[24,y],[24,y+4],[12,y+11]],ink);line(0,y+5,12,y+12,dark);line(12,y+12,23,y+6,dark);}break;
    case 255:
      rect(0,0,24,24,dark);for(const[x,y,rx,ry,c]of[[3,4,3,4,light],[11,3,4,3,base],[20,4,3,4,pale],[5,13,4,4,base],[15,12,5,4,light],[22,14,2,4,base],[3,21,4,3,pale],[12,21,4,3,base],[21,22,4,3,light]]){disk(x,y,rx,ry,c);line(x-1,y-ry+1,x+1,y-ry+1,tone(c,20));}break;
    case 256:
      line(2,0,7,7,ink);line(7,7,11,10,ink);line(11,10,14,17,ink);line(14,17,22,23,ink);line(8,7,17,3,tone(base,-24));line(13,15,3,21,tone(base,-24));line(3,0,8,7,pale);break;
    case 257:
      poly([[0,2],[9,6],[12,12],[24,16],[24,19],[10,14],[7,8],[0,5]],cream);line(11,13,6,23,light);line(13,12,18,1,light);line(0,18,8,20,ink);break;
    case 258:
      for(let y=0;y<24;y++){const off=[0,1,1,0,-1,-1,0,2][y%8];if([2,3,8,14,20].includes(y))for(let x=0;x<24;x++)put(x,y+(x>14?off:0),y===3?pale:y===14?cream:ink);}break;
    case 259:
      for(let t=0;t<45;t++){const a=t*.24,r=1+t*.13;put(9+Math.cos(a)*r,11+Math.sin(a)*r,ink);}line(17,3,19,19,ink);for(let y=5;y<19;y+=3){line(18,y,14,y-2,light);line(18,y,22,y-2,ink);}break;
    case 260:
      for(let y=-4;y<24;y+=8)for(let x=-6;x<24;x+=12){ring(x+6,y+8,6,cream,2);ring(x+6,y+8,3,light,1);}break;
    case 261:
      disk(11.5,11.5,5,5,light);ring(11.5,11.5,5,dark);for(let k=0;k<12;k++){const a=k*Math.PI/6;line(12+7*Math.cos(a),12+7*Math.sin(a),12+10*Math.cos(a),12+10*Math.sin(a),k%2?cream:ink);}frame(0,ink);break;
    case 262:
      for(const r of[5,9,13,17,21])ring(12,23,r,r%2?ink:light,2);for(let k=0;k<=8;k++){const a=Math.PI+k*Math.PI/8;line(12,23,12+23*Math.cos(a),23+23*Math.sin(a),light);}line(0,23,23,23,dark);break;
    case 263:
      for(const[x,shift]of[[4,0],[12,3],[20,1]]){rect(x-1,0,3,24,light);line(x+2,0,x+2,23,ink);for(let y=shift;y<24;y+=8){rect(x-2,y,5,2,dark);line(x+2,y+5,x+6,y+2,ink);}}break;
    case 264:
      poly([[12,0],[15,7],[22,3],[18,10],[24,12],[18,15],[22,21],[15,18],[12,24],[9,18],[3,22],[6,15],[0,12],[6,9],[3,3],[9,6]],cream);poly([[12,5],[19,12],[12,19],[5,12]],ink);rect(10,10,4,4,rgb('#bb815c'));break;
    case 265:
      for(let y=0;y<24;y+=8)for(let x=0;x<24;x+=8){const v=(x+y)/8%2===0;rect(x,y,8,8,ink);for(let n=0;n<2;n++){rect(x+1+(v?n*3:0),y+1+(v?0:n*3),v?2:6,v?6:2,n?base:light);}}break;
    case 266:
      rect(0,0,24,24,cream);for(let y=-6;y<24;y+=12)for(let x=-6;x<24;x+=12){poly([[x+3,y],[x+9,y],[x+12,y+3],[x+12,y+9],[x+9,y+12],[x+3,y+12],[x,y+9],[x,y+3]],base);line(x+3,y+1,x+8,y+1,pale);line(x+1,y+3,x+1,y+8,ink);}break;
    case 267:
      frame(1,ink);for(const[cx,cy]of[[8,8],[15,8],[8,15],[15,15]])disk(cx,cy,4,4,rgb('#75928a'));poly([[12,7],[17,12],[12,17],[7,12]],cream);disk(12,12,2,2,rgb('#aa6e51'));break;
    case 268:
      for(let x=0;x<24;x+=6){rect(x,0,1,24,dark);rect(x+1,1,4,2,light);rect(x+1,21,4,2,ink);line(x+4,4,x+4,19,light);}line(0,0,23,0,ink);line(0,23,23,23,dark);break;
    case 269:
      for(const x of[0,8,16]){line(x,0,x,23,dark);line(x+1,0,x+1,23,light);line(x+4,3,x+5,16,ink);}for(const[x,y]of[[3,3],[19,3],[3,19],[19,19]])rect(x,y,2,2,dark);break;
    case 270:
      for(let y=-12;y<24;y+=6){line(0,y,12,y+6,light,2);line(12,y+6,24,y,ink,2);line(0,y+3,12,y+9,dark);}line(1,0,1,23,cream);line(22,0,22,23,ink);break;
    case 271:
      for(let y=-16;y<32;y+=8){poly([[0,y],[12,y+8],[12,y+12],[0,y+4]],light);poly([[12,y+8],[24,y],[24,y+4],[12,y+12]],ink);line(1,y+2,11,y+8,pale);line(13,y+10,22,y+4,dark);}break;
    case 272:
      for(let x=3;x<24;x+=6)line(x,0,x,23,ink);frame(1,dark);frame(2,light);line(3,3,19,19,ink,3);line(19,3,3,19,ink,3);line(4,3,20,19,light);break;
    case 273:
      for(const n of[0,3,6,9]){frame(n,ink);if(n<9)frame(n+1,light);}for(const[x,y]of[[2,2],[20,2],[2,20],[20,20]])put(x,y,dark);break;
    case 274:
      for(let y=-8;y<24;y+=10)for(let x=-6+(y%20===0?0:6);x<24;x+=12){rect(x,y,12,5,ink);disk(x+5.5,y+4,5.5,5.5,light);line(x+1,y+3,x+1,y+7,base);rect(x+5,y+1,2,2,dark);}break;
    case 275:
      rect(0,0,24,24,dark);for(let y=-6;y<24;y+=10)for(let x=-6;x<24;x+=12){const off=((y+6)/10%2)*6;poly([[x+off+3,y],[x+off+9,y],[x+off+12,y+5],[x+off+9,y+10],[x+off+3,y+10],[x+off,y+5]],base);line(x+off+3,y+1,x+off+9,y+1,light);line(x+off+1,y+5,x+off+3,y+9,ink);}break;
    case 276:
      for(const x of[1,5,9,14,20]){line(x,0,x,23,dark);line(x+1,0,x+1,23,light);}for(const[x,y]of[[3,4],[11,15],[18,8]]){line(x,y,x+2,y+4,dark);line(x+2,y+4,x+1,y+7,dark);}break;
    case 277:
      for(let y=0;y<24;y+=8){line(0,y,23,y,dark);line(0,y+1,23,y+1,light);for(let x=2;x<23;x+=5)line(x,y+3,x+3,y+4,ink);}for(const[x,y]of[[2,3],[20,3],[3,11],[19,11],[2,19],[20,19]])rect(x,y,2,2,dark);break;
    case 278:
      rect(0,0,24,24,cream);for(const i of[0,7,15,23]){rect(i,0,2,24,ink);rect(0,i,24,2,ink);}for(const[x,y]of[[3,3],[11,11],[18,18]])line(x,y,x+2,y+1,pale);break;
    case 279:
      for(const x of[2,14]){rect(x,0,2,24,dark);rect(x+2,0,2,24,light);line(x+4,0,x+4,23,pale);}line(0,22,23,22,ink);line(0,23,23,23,light);break;
    case 280:
      for(let y=-12;y<24;y+=12)for(let x=-12;x<24;x+=12){line(x+6,y,x+12,y+6,light);line(x+12,y+6,x+6,y+12,dark);line(x+6,y+12,x,y+6,ink);line(x,y+6,x+6,y,pale);}break;
    case 281:
      for(let x=0;x<24;x+=8){rect(x,0,2,24,dark);rect(x+2,0,4,24,light);rect(x+6,0,1,24,pale);rect(x+7,0,1,24,ink);}line(0,21,23,21,ink);break;
    case 282:
      frame(0,dark);frame(2,light);frame(4,ink);for(const[x,y]of[[3,3],[20,3],[3,20],[20,20]]){disk(x,y,2,2,ink);put(x-1,y-1,pale);}line(8,11,15,11,light);break;
    case 283:
      for(let y=2;y<24;y+=6)for(let x=2+(y%12?0:3);x<24;x+=6){disk(x,y,2.5,2,ink);line(x-1,y-1,x+1,y-1,light);put(x,y+1,dark);}break;
    case 284:
      for(let y=0;y<24;y+=12)for(let x=0;x<24;x+=12){rect(x+1,y+1,10,10,ink);rect(x+2,y+2,8,8,base);line(x+2,y+2,x+9,y+2,light);line(x+2,y+2,x+2,y+9,light);rect(x,y,2,2,rgb('#a37951'));}break;
    case 285:
      for(let y=0;y<24;y+=8){rect(0,y,24,2,dark);line(0,y+2,23,y+2,light);for(let x=(y%16?6:0);x<24;x+=12){line(x,y+2,x,y+7,ink);line(x+1,y+2,x+1,y+7,pale);}}break;
    case 286:
      for(let x=0;x<24;x+=3){line(x,0,x+1,23,x%2?light:ink);line(x+1,0,x+2,23,pale);}for(const y of[6,18]){rect(0,y,24,2,dark);line(0,y,23,y,base);for(let x=2;x<24;x+=6)line(x,y-1,x+1,y+2,cream);}break;
    case 287:
      for(let y=-6;y<24;y+=8)for(let x=-4+(y%16?0:4);x<24;x+=8){rect(x,y,8,8,ink);rect(x+1,y+1,6,5,base);line(x+1,y+1,x+6,y+1,light);line(x+1,y+6,x+6,y+6,dark);line(x+4,y+2,x+4,y+5,pale);}break;
    case 288:
      for(let y=-8;y<24;y+=8)for(let x=-6+(y%16?0:6);x<24;x+=12){poly([[x,y],[x+12,y],[x+12,y+5],[x+6,y+8],[x,y+5]],ink);poly([[x+1,y+1],[x+11,y+1],[x+11,y+4],[x+6,y+6],[x+1,y+4]],base);line(x+2,y+2,x+9,y+2,pale);line(x+1,y+5,x+5,y+7,light);}break;
    default:throw new Error('C25 authored motif missing '+def.id);
    }
    return data;
  }
  function makeTile(key,size=24){
    if(size!==16&&size!==24)throw new RangeError('C25 texture packs use 16 or 24 only');
    const native=nativeTile(key);
    if(size===24)return {key,size,data:native,origin:'top-left',nativeGenerationGrid:24,version};
    const data=new Uint8ClampedArray(16*16*4);
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const src=(Math.floor((x+.5)*24/16)+Math.floor((y+.5)*24/16)*24)*4;data.set(native.subarray(src,src+4),(x+y*16)*4);}
    return {key,size,data,origin:'top-left',nativeGenerationGrid:24,compatibilityResample:'nearest-downsample24to16',version};
  }

const deepFreeze=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')deepFreeze(v);return Object.freeze(o);};
const defs=deepFreeze([...surfaces,...forms]);
const tileKeys=Object.freeze([...new Set(defs.flatMap(d=>d.faceKeys))]);
if(defs.length!==100||new Set(defs.map(d=>d.id)).size!==100||new Set(defs.map(d=>d.name)).size!==100||defs.some((d,i)=>d.id!==249+i)||tileKeys.length!==50)throw Error('C25 authored registry contract failed');
const api=Object.freeze({version,defs,tileKeys,makeTile,nativeGenerationGrid:24,faceOrder:Object.freeze(['+X','-X','+Y','-Y','+Z','-Z'])});
globalThis.VoxelC25Crafted=api;
if(typeof module!=='undefined')module.exports=api;
})();
